import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Decision Thread Labs',
  description: 'Map decisions. Accelerate them. Govern them.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Material Symbols for icon buttons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-dtl-ow text-slate-800 antialiased">
        <Nav />
        <main className="pt-16 px-4 md:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
