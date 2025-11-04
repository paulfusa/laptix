import Image from 'next/image'
import { cookies } from 'next/headers';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = await getLoggedInUser();
  // Allow a temporary 'linking' cookie to keep the auth layout open while a
  // newly-signed-up user completes the Plaid link flow. If the user is
  // logged in and NOT currently linking, redirect to the app root.
  const cookieStore = await cookies();
  const linking = cookieStore.get('linking');
  if (loggedIn && !linking) redirect('/');
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