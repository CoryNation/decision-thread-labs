import './globals.css';
import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';

export const metadata: Metadata = {
  title: 'Decision Thread Labs',
  description: 'Map decisions. Accelerate them. Govern them.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-800 antialiased">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
