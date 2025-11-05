'use client'; 

import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { navbarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Footer from './Footer';
import PlaidLink from './PlaidLink';
import { ModeToggle } from './ui/mode-toggle';

const NavBarTop = ({user}: NavBarTopProps) => {
  const pathname = usePathname();
  return (
    <header className="relative">
        <nav className="navbar-top">
            <Link href="/" className="flex cursor-pointer items-center "> 
                <Image 
                src="/icons/laptix-logo.png" 
                alt="Laptix Logo" 
                width={48} height={48} 
                className="size-[36px] max-xl:size-12"/>
                <h1 className="navbar-logo ">Laptix</h1>
            </Link>

            {navbarLinks.map((item) => {
                const isActive = item.route === pathname || pathname.startsWith(`${item.route}/`);
                return(
                    <Link 
                        href={item.route}
                        key={item.label}
                        className={cn('navbar-link', { 'bg-primary-gradient shadow-s': isActive })}
                    >
                        <div className="relative-size-6">
                            <Image 
                                src={item.imgURL} 
                                alt={item.label} 
                                height={24} width={24} //fill didnt work
                                className={cn({'brightness-[3] invert-0': isActive})}
                            />
                        </div>
                        <p className={cn('navbar-label',{'!text-white':isActive})}>
                            {item.label}
                        </p>
                    </Link>
                )
            })}
        <ModeToggle />
        </nav>
    </header>
  )
}

export default NavBarTop