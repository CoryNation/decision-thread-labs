import Link from 'next/link';

export default function Page() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">Software</h1>
      <div className="prose container-prose">
        <p>The Decision Thread app provides a canvas to model decisions, their inputs/outputs, and dependencies, plus analytics and exports.</p>
        <p><Link href="/app" className="text-dtl-teal underline">Open the App</Link></p>
      </div>
    </section>
  );
}
