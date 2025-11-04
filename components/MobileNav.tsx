'use client';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image'
import Link from 'next/link'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Footer from "./Footer";

const MobileNav = ({user}:MobileNavProps) => {
    const pathname = usePathname();
    return (
        <section className="w-full max-w-[264px]">
            <Sheet>
                <SheetTrigger>
                    <Image
                        src="/icons/hamburger.svg"
                        alt="Menu Icon"
                        width={30}
                        height={30}
                    />
                </SheetTrigger>
                <SheetContent side="left" className="border-none bg-white">
                    <nav className="flex flex-col px-4 ">
                        <Link href="/" className="flex cursor-pointer items-center  px-4 py-8"> 
                            <Image 
                            src="/icons/laptix-logo.png" 
                            alt="Laptix Logo" 
                            width={34} height={34} 
                            />
                            <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Laptix</h1>
                        </Link>
                        <div className="mobilenav-sheet">
                            <SheetClose asChild>
                                <nav className="flex h-full flex-col gap-2 pt-0 text-white">
                                    {sidebarLinks.map((item) => {
                                        const isActive = item.route === pathname || pathname.startsWith(`${item.route}/`);
                                        return(
                                            <SheetClose asChild key={item.route}>
                                                <Link 
                                                    href={item.route}
                                                    key={item.label}
                                                    className={cn('mobilenav-sheet_close w-full', {'bg-bank-gradient': isActive})}
                                                >
                                                    <div className="relative-size-6">
                                                        <Image 
                                                            src={item.imgURL} 
                                                            alt={item.label} 
                                                            height={20} width={20} 
                                                            className={cn({'brightness-[3] invert-0': isActive})}
                                                        />
                                                    </div>
                                                    <p className={cn('text-16 font-semibold text-black-2',{'!text-white':isActive})}>
                                                        {item.label}
                                                    </p>
                                                </Link>
                                            </SheetClose>
                                        )
                                    })}
                                USER
                                </nav>
                            </SheetClose>
                            <Footer user={user} type="mobile" />
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </section>
)
}

export default MobileNav