export default function HomePage() {
  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-2">
      <section>
        <h1 className="text-[44px] leading-tight font-extrabold tracking-tight text-slate-900 md:text-6xl">
          Every product is the
          <br /> result of decisions.
          <br />
          <span className="text-teal-600">Map them. Accelerate</span>
          <br />
          <span className="text-teal-600">them. Govern them.</span>
        </h1>

        <p className="mt-6 max-w-xl text-slate-600">
          Decision Thread Labs helps organizations visualize and improve the
          decisions that drive value—end to end.
        </p>

        <div className="mt-6 flex gap-3">
          <a
            href="/contact"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-slate-800"
          >
            Book a Workshop
          </a>
          <a
            href="/request-access"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Request App Access
          </a>
        </div>
      </section>

      <aside className="pt-2">
        <p className="text-sm text-slate-500">
          Visualize your value stream as a network of decisions. Identify inputs,
          bottlenecks, and information flows using a SIPOC-aligned model.
        </p>
        <div className="mt-6 h-72 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/40 text-center text-slate-400">
          <span className="inline-block translate-y-28">
            [Concept visualization placeholder]
          </span>
        </div>
      </aside>
    </main>
  );
}
