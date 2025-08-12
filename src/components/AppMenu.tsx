'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { href: '/app/projects', label: 'Projects' },
  { href: '/app/settings', label: 'Settings' },
  { href: '/app/settings/organization', label: 'Organization' },
];

export default function AppMenu() {
  const pathname = usePathname();
  return (
    <div className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <ul className="flex gap-4 text-sm">
          {items.map(i => (
            <li key={i.href}>
              <Link
                href={i.href}
                className={clsx(
                  "inline-block py-3 px-2 border-b-2 border-transparent hover:text-dtl-teal",
                  pathname.startsWith(i.href) && "border-dtl-teal text-dtl-teal font-semibold"
                )}
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
