'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "../plaid";
import { parse } from "path";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {APPWRITE_DATABASE_ID: DATABASE_ID, APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID, APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    )

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession(email, password);
    const cookieStore = await cookies(); // Required for Next.js 13.4+
    // In development (http) we must not set `secure: true` otherwise the
    // cookie won't be stored by the browser. Use secure cookies only in
    // production (https).
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    const user = await getUserInfo({ userId: session.userId });

    return parseStringify(user);
  } catch (error) {
    console.error('[signIn] Error', error);
  }
}

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  const { email, firstName, lastName } = userData;
  
  let newUserAccount;

  try {
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(), 
      email, 
      password, 
      `${firstName} ${lastName}`
    );

    if(!newUserAccount) throw new Error('Error creating user')

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: 'personal'
    })

    if(!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer')

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl
      }
    )

    const session = await account.createEmailPasswordSession(email, password);
    const cookieStore = await cookies(); // Required for Next.js 13.4+
    // See note above about secure flag in development vs production.
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error('Error', error);
  }
}

export async function getLoggedInUser() {
  // Try to create a session client. If none exists, return null quietly
  // (don't log a stack trace) — callers expect null for unauthenticated users.
  const sessionClient = await createSessionClient();
  if (!sessionClient) return null;

  try {
    const { account } = sessionClient;
    const result = await account.get();

    const user = await getUserInfo({ userId: result.$id});

    return parseStringify(user);
  } catch (error) {
    // If account.get() or subsequent calls fail, log at debug level but
    // return null so the app treats the request as unauthenticated.
    console.debug('[getLoggedInUser] Error fetching user', error);
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const sessionClient = await createSessionClient();
    const cookieStore = await cookies();

    // Always remove cookie locally
    cookieStore.delete('appwrite-session');

    // If there's no server-side session client (no cookie), consider
    // logout successful (idempotent).
    if (!sessionClient) return true;

    const { account } = sessionClient;
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
}

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id
      },
      client_name: `${user.firstName} ${user.lastName}`,
      // Request both `auth` and `transactions` so the resulting Item has consent
      // to access transaction data. If a user previously linked with only `auth`,
      // they will need to re-link (see notes below).
      products: ['auth', 'transactions'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
    }

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({linkToken: response.data.link_token});

  } catch (error) {
    console.error("Error creating link token:", error);
    return null;
  }
}

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        shareableId,
      }
    )
    // Ensure the token was stored successfully
    if (!bankAccount?.$id) {
      throw new Error('Failed to create bank account document');
    }

    return parseStringify(bankAccount);
  } catch (error) {
    console.error("Error creating bank account:", error);
    throw error; // Re-throw to let caller handle the error 
  }
}

export const exchangePublicToken = async ({ publicToken, user }: exchangePublicTokenProps) => {
  try {
    // Exchange public token for access token and item ID
    console.log('Exchanging public token for access token...');
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    if (!response?.data?.access_token || !response?.data?.item_id) {
      throw new Error('Failed to exchange public token: Missing access_token or item_id');
    }

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    console.log('Successfully got access token and item ID');


    // Get account information from Plaid using the access token
    console.log('Getting account information from Plaid...');
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    if (!accountsResponse?.data?.accounts?.[0]) {
      throw new Error('Failed to get account information from Plaid');
    }

    const accountData = accountsResponse.data.accounts[0];
    console.log('Successfully got account information');


    //Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    console.log('Creating processor token...');
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum
    }

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    if (!processorTokenResponse?.data?.processor_token) {
      throw new Error('Failed to create processor token');
    }
    const processorToken = processorTokenResponse.data.processor_token;
    console.log('Successfully created processor token');

    // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    console.log('Creating funding source...');
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name
    });

    // If the funding source URL is not created, throw an error
    if (!fundingSourceUrl) {
      throw Error("Failed to create funding source");
    }
    console.log('Successfully created funding source');


    //Create a bank account using the user ID, item ID, access token, and funding source URL, and sharable ID
    // ERROR HERE
    console.log('Creating bank account in Appwrite...');
    const bankAccount = await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id),
    });

    if (!bankAccount) {
      throw new Error('Failed to create bank account in Appwrite');
    }
    console.log('Successfully created bank account in Appwrite');

    // Revalidate the path to reflect the changes
    revalidatePath('/');

    return parseStringify({ publicTokenExchange: "complete", bankAccount });

  } catch (error) {
    console.error("Error exchanging public token:", error);
    throw error; // Re-throw so the UI can handle the error
  }
}

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(banks.documents); 
  } catch (error) {
    console.error("Error getting banks:", error);
  } 
}

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();
    
    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('$id', [documentId])]
    )

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('accountId', [accountId])]
    )

    if(bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}