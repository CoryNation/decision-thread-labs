'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Home' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/services', label: 'Services' },
  { href: '/software', label: 'Software' },
  { href: '/book', label: 'Book' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/app', label: 'App' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="w-full bg-white/80 backdrop-blur sticky top-0 z-50 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-dtl-navy">Decision Thread Labs</Link>
        <div className="flex-1" />
        <ul className="flex items-center gap-4 text-sm">
          {links.map(l => (
            <li key={l.href}>
              <Link
                className={clsx("px-2 py-1 rounded-md hover:bg-dtl-ow",
                  pathname === l.href && "text-dtl-teal font-semibold")}
                href={l.href}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
