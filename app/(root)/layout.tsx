import Image from 'next/image'
import Sidebar from "@/components/Sidebar";
import MobileNav from '@/components/MobileNav';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import NavBarTop from '@/components/NavBarTop';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = await getLoggedInUser();
  if(!loggedIn) redirect('/sign-in')
  return (
    <main>
      <NavBarTop user={loggedIn}/>
        {/* <div className="root-layout">
          <Image
            src="/icons/laptix-logo.png"
            width={30} height={30}
            alt="Laptix Logo"/>
            <div>
              <MobileNav user={loggedIn}/>
            </div>
        </div> */}
        {children}      
    </main>
  );
}
