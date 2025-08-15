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
      <body className="bg-[#F5F7FA] text-slate-800 antialiased">
        <Nav />
        {/* leave space for the fixed navbar */}
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
