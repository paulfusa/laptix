"use server";

import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks = await getBanks({ userId });

    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        // get each account info from plaid
        const accountsResponse = await plaidClient.accountsGet({
          access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts[0];

        // get institution info from plaid
        const institution = await getInstitution({
          institutionId: accountsResponse.data.item.institution_id!,
        });

        const account = {
          id: accountData.account_id,
          availableBalance: accountData.balances.available!,
          currentBalance: accountData.balances.current!,
          institutionId: institution.institution_id,
          name: accountData.name,
          officialName: accountData.official_name,
          mask: accountData.mask!,
          type: accountData.type as string,
          subtype: accountData.subtype! as string,
          appwriteItemId: bank.$id,
          shareableId: bank.shareableId,
        };
        return account;
      })
    );

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // get bank from db
    const bank = await getBank({ documentId: appwriteItemId });

    // get account info from plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];

    // get transfer transactions from appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions = transferTransactionsData.documents.map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        // Ensure category is a string and fall back to 'Transfer' when missing
        category: transferData.category && transferData.category.length ? transferData.category : "Transfer",
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      })
    );

    // get institution info from plaid
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    const transactions = await getTransactions({
      accessToken: bank?.accessToken,
    });

    // Defensive: ensure transactions is an array (getTransactions may return undefined on error)
    const txs = Array.isArray(transactions) ? transactions : [];

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      appwriteItemId: bank.$id,
    };

    // sort transactions by date such that the most recent transaction is first
      const allTransactions = [...txs, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // DEBUG: log categories to help diagnose uncategorized transactions
    try {
      console.log("DEBUG: transaction categories ->", allTransactions.map((tx) => ({ id: tx.id, category: tx.category })));
    } catch (err) {
      console.log("DEBUG: failed to log transaction categories", err);
    }

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
      });

      const data = response.data;

      // DEBUG: log raw Plaid 'added' items so we can inspect category arrays
      try {
        console.log(
          "DEBUG: raw Plaid added items ->",
          response.data.added.map((tx: any) => ({
            id: tx.transaction_id,
            name: tx.name,
            category: tx.category,
          }))
        );
      } catch (err) {
        console.log("DEBUG: failed to log raw Plaid items", err);
      }

      // Small heuristic: infer category from merchant name when Plaid returns null
      const inferCategoryFromName = (name: string | undefined, rawCategory: string | null) => {
        if (rawCategory && rawCategory !== "Uncategorized") return rawCategory;
        if (!name) return "Uncategorized";
        const n = name.toLowerCase();

        if (n.includes("uber") || n.includes("lyft") || n.includes("taxi") || n.includes("pool")) return "Travel";
        if (n.includes("united") || n.includes("airlines") || n.includes("delta") || n.includes("flight")) return "Travel";
        if (n.includes("mcdonald") || n.includes("starbucks") || n.includes("coffee") || n.includes("restaurant") || n.includes("deli")) return "Food and Drink";
        if (n.includes("grocery") || n.includes("walmart") || n.includes("costco") || n.includes("supermarket")) return "Groceries";
        if (n.includes("sparkfun") || n.includes("amazon") || n.includes("shop") || n.includes("store") || n.includes("shopify")) return "Shopping";
        if (n.includes("atm") || n.includes("withdrawal")) return "ATM";
        if (n.includes("rent") || n.includes("mortgage")) return "Rent";
        if (n.includes("payroll") || n.includes("salary") || n.includes("deposit") || n.includes("direct deposit")) return "Income";
        if (n.includes("refund")) return "Refund";

        return "Uncategorized";
      };

      transactions = response.data.added.map((transaction) => {
        const rawCat = transaction.category && transaction.category.length ? transaction.category[0] : null;
        const inferred = inferCategoryFromName(transaction.name, rawCat);

        return {
          id: transaction.transaction_id,
          name: transaction.name,
          paymentChannel: transaction.payment_channel,
          // Plaid doesn't provide debit/credit directly in this field; keep original if available
          type: transaction.payment_channel,
          accountId: transaction.account_id,
          amount: transaction.amount,
          pending: transaction.pending,
          category: inferred,
          date: transaction.date,
          image: transaction.logo_url,
        };
      });

      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error(
      "Plaid transactionsSync error:",
      (error as any)?.response?.data ?? error
    );

    // Return a safe empty array so callers can continue (and not crash when spreading)
    return parseStringify([]);
  }
};