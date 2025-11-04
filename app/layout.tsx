export const dynamic = 'force-dynamic'


// Root Layout Init (Not Root Layout Page)
import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter= Inter({subsets: ["latin"], variable: "--font-inter"});
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"], 
  weight: ['400','700'],
  variable: "--font-ibm-plex-serif"
});

export const metadata: Metadata = {
  title: "Laptix",
  description: "Banking Platform",
  icons: {icon: '/icons/laptix-logo.png'},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> 
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
