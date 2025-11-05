import React, { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { usePlaidLink, type PlaidLinkOnSuccess, type PlaidLinkOptions } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken, clearLinkingCookie } from '@/lib/actions/user.actions';
import Image from 'next/image';

const PlaidLink = ({user, variant}: PlaidLinkProps) => {
  const router = useRouter();

  const [token, setToken] = useState('');

  useEffect(() => {
    const getLinkToken = async () => {
      const data = await createLinkToken(user);
      setToken(data?.linkToken);
    }
    getLinkToken();
  }, [user]);

  const onSuccess =  useCallback<PlaidLinkOnSuccess>(async(public_token: string) => {
    try {
      const result = await exchangePublicToken({
        publicToken: public_token,
        user,
      });
      
      if (!result?.bankAccount) {
        throw new Error('Failed to create bank account');
      }
      // Clear the temporary linking cookie so the auth layout will allow
      // normal redirection for logged-in users.
      await clearLinkingCookie();
      router.push('/');
    } catch (error) {
      console.error('Failed to set up bank account:', error);
      alert('Failed to connect bank account. Please try again.');
    }
  }, [user, router]);

  const config: PlaidLinkOptions = {
    token,
    onSuccess
  }

  const {open, ready} = usePlaidLink(config); 

  return (
    <>
      {variant === 'primary' ? (
        // SIGNING UP
        <Button
          onClick={() => open()}
          disabled={!ready}
          className="plaidlink-primary shadow-fade"
        >
          Connect bank
        </Button>
      ) : variant === 'ghost' ? (
        <Button onClick={() => open()} variant="ghost" className="plaidlink-ghost shadow-fade">
          <Image
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className='hiddenl text-[16px] font-semibold sidebar-label xl:block'>Connect bank</p>
        </Button>
      ) : (
        // RIGHT SIDEBAR
        <Button onClick={() => open()} className="plaidlink-default shadow-fade">
          <Image
            src="/icons/plus.svg"
            alt="Add Bank"
            width={20}
            height={20}/>
            {/* brightness-[3] invert-0 */}
          <h2 className= "plaidlink-addbank">Add Bank</h2>
        </Button>
      )}
    </>
  )
}

export default PlaidLink