import Image from 'next/image'
import Sidebar from "@/components/Sidebar";
import MobileNav from '@/components/MobileNav';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = await getLoggedInUser();
  // This is the layout for auth pages (sign-in / sign-up). If the user is
  // already logged in, redirect them to the app root. If not logged in,
  // allow rendering the auth pages (do not redirect back to /sign-in — that
  // would create a redirect loop).
  if (loggedIn) redirect('/');
  // Auth pages should not render the full app chrome (Sidebar / Nav)
  // — they are public and may mount client components that assume a user.
  // Keep this layout minimal so sign-in / sign-up don't trigger user-only
  // effects (Plaid / footer actions etc.).
  return (
    <main className="flex-center size-full font-inter">
      <div className="auth-container w-full max-w-lg">
        {children}
      </div>
    </main>
  );
}