import Link from 'next/link'

export default function AppHome() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Decision Thread App</h1>
      <p className="text-dtl-charcoal">Select a project to begin mapping decisions.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/app/projects" className="btn btn-accent">Open Projects</Link>
      </div>
    </section>
  )
}
