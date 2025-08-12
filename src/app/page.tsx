import Link from 'next/link'

export default function Home() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Every product is the result of decisions.
            <span className="block text-dtl-teal">Map them. Accelerate them. Govern them.</span>
          </h1>
          <p className="mt-6 text-lg text-dtl-charcoal">
            Decision Thread Labs helps organizations visualize and improve the
            decisions that drive value—end to end.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/services" className="btn btn-primary">Book a Workshop</Link>
            <Link href="/software" className="btn btn-accent">Request App Access</Link>
          </div>
        </div>
        <div className="card p-6">
          <p className="text-sm text-dtl-charcoal">
            Visualize your value stream as a network of decisions. Identify inputs,
            bottlenecks, and information flows using a SIPOC-aligned model.
          </p>
          <div className="mt-4 rounded-xl bg-dtl-ow h-64 flex items-center justify-center">
            <span className="text-dtl-charcoal">[Concept visualization placeholder]</span>
          </div>
        </div>
      </div>
    </section>
  )
}
