import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Decision Thread Labs',
  description: 'Map decisions, information flow, and opportunities.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Load Material Symbols for icon buttons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-dtl-ow text-slate-800 antialiased">
        {children}
      </body>
    </html>
  )
}
