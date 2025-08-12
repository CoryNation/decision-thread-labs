import Link from 'next/link';

export default function SettingsHome() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ul className="mt-4 list-disc pl-5 text-dtl-charcoal">
        <li><Link href="/app/settings/organization" className="text-dtl-teal underline">Organization</Link></li>
      </ul>
    </section>
  );
}
