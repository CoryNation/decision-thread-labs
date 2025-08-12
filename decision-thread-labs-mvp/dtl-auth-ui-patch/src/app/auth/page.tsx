import AuthButtons from '@/components/AuthButtons'

export default function AuthPage() {
  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-dtl-charcoal">
          Use Google or request a magic link via email.
        </p>
        <div className="mt-6">
          <AuthButtons />
        </div>
      </div>
    </section>
  )
}
