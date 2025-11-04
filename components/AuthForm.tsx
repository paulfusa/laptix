'use client';
import Link from 'next/link'
import React, { use, useState } from 'react'
import Image from 'next/image'

import { z } from "zod"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { Form,} from "@/components/ui/form"
import CustomInput from './CustomInput';
import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { date, email } from 'zod/v4-mini';
import { useRouter } from 'next/navigation';
import { getLoggedInUser, signIn, signUp } from '@/lib/actions/user.actions';
import PlaidLink from './PlaidLink';


const AuthForm = ({type}: {type:string}) => {
    const router = useRouter() ;
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const formSchema = authFormSchema(type);

    // 1. Define  form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        email: "",
        password: "",
        },
    })
 
    // 2. Define a submit handler.
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            // Sign-up with appwrite and create plaid link token
            const userData = {
                firstName: data.firstName!,
                lastName: data.lastName!,
                email: data.email,
                password: data.password,
                city: data.city!,
                state: data.state!,
                postalCode: data.postalCode!,
                dateOfBirth: data.dateOfBirth!,
                ssn: data.ssn!,
                address1: data.address1!,
            }
            if(type === 'sign-up') {
                const newUser = await signUp(userData);
                setUser(newUser);
                
            }
            // Sign-in 
            else
            if(type === 'sign-in') {
                const response = await signIn({
                    email: data.email,
                    password: data.password,
                })

                if(response) router.push('/');

            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsLoading(false);
        }

        setIsLoading(false);
    }

    return (
        <section className="auth-form">
            {/* Header */}
            <header className='flex flex-col gap-5 md:gap-8'>
                <Link href="/" className="flex cursor-pointer items-center "> 
                    <Image 
                        src="/icons/laptix-logo.png" 
                        alt="Laptix Logo" 
                        width={36} height={36} 
                        />
                    <h1 className="text-26 font-bold p-2">Laptix</h1>
                </Link>
                
                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className="text-24 lg:text-36 font-semibold">
                        {user
                            ? 'Link Account'
                            : type === 'sign-in'
                            ? 'Sign In'
                            : 'Sign Up'
                        }
                        <p className='text-16 font-normal'>
                            {user
                                ? 'Link your account to continue'
                                : 'Create a new account to get started.'
                            }
                        </p>
                    </h1>
                </div>
            </header>
            
            {user ? (
                <div className="flex flex-col gap-4">
                    <PlaidLink user={user} variant="primary"/>
                </div>
            ): (
                // Sign-in and Sign-up Form
                <>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {type === 'sign-up' && (
                            <>
                            <div className="flex gap-4">
                                <CustomInput control={form.control} name="firstName" label="First Name" placeholder="Enter your first name" />
                                <CustomInput control={form.control} name="lastName" label="Last Name" placeholder="Enter your last name" />
                            </div>

                            <CustomInput control={form.control} name='address1' label="Address" placeholder='Enter your specific address' />
                            <CustomInput control={form.control} name='city' label="City" placeholder='Enter your city' />
                            
                            <div className="flex gap-4">
                                <CustomInput control={form.control} name="state" label="State" placeholder="Enter your state" />
                                <CustomInput control={form.control} name="postalCode" label="ZIP / Postal Code" placeholder="Enter your ZIP code" />
                            </div>
                            <div className="flex gap-4">
                                <CustomInput control={form.control} name="dateOfBirth" label="Date of Birth" placeholder="YYYY-MM-DD" />
                                <CustomInput control={form.control} name="ssn" label="SSN" placeholder="Enter your SSN" />
                            </div>
                            </>
                        )}

                        <CustomInput control={form.control} name="email" label="Email" placeholder="Enter your email" />
                        <CustomInput control={form.control} name="password" label="Password" placeholder="Enter your password" />
                        
                        <div className='flex flex-col gap-4'>
                            <Button type="submit" className='form-btn' disabled={isLoading}>
                            {isLoading ? (
                                <>
                                <Loader2 size={20} className="animate-spin"/> &nbsp;Loading
                                </>
                            ) : type=== 'sign-in' ? 'Sign in' : 'Sign up'}
                            </Button>
                        </div>
                    </form>
                    </Form>

                    {/* FOOTER */}
                    <footer className='flex justify-center gap-1'>
                        <p className='text-14 font-normal'>{type === 'sign-in'
                        ? "Don't have an account?"
                        : "Already have an account?"}
                        </p>
                        <Link href={type === 'sign-in' 
                            ? '/sign-up' 
                            : '/sign-in'} className='form-link'>
                            {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
                        </Link>
                    </footer>
                </ >
            )} 
        </section>
  )
}

export default AuthForm