'use client'; 

import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Footer from './Footer';
import PlaidLink from './PlaidLink';
import { ModeToggle } from './ui/mode-toggle';

const NavBarTop = ({user}: NavBarTopProps) => {
  const pathname = usePathname();
  return (
    <header className="navbar-top">
        <nav className="flex flex-col gap-4">
            <Link href="/" className="mb-12 flex cursor-pointer items-center gap-2"> 
                <Image 
                src="/icons/laptix-logo.png" 
                alt="Laptix Logo" 
                width={36} height={36} 
                className="size-[36px] max-xl:size-12"/>
                <h1 className="sidebar-logo p-1">Laptix</h1>
            </Link>

            {sidebarLinks.map((item) => {
                const isActive = item.route === pathname || pathname.startsWith(`${item.route}/`);
                return(
                    <Link 
                        href={item.route}
                        key={item.label}
                        className={cn('sidebar-link', { 'bg-primary-gradient shadow-s': isActive })}
                    >
                        <div className="relative-size-6">
                            <Image 
                                src={item.imgURL} 
                                alt={item.label} 
                                height={24} width={24} //fill didnt work
                                className={cn({'brightness-[3] invert-0': isActive})}
                            />
                        </div>
                        <p className={cn('sidebar-label',{'!text-white':isActive})}>
                            {item.label}
                        </p>
                    </Link>
                )
            })}
        <ModeToggle />
        </nav>
        <Footer user={user}/>
    </header>
  )
}

export default NavBarTop