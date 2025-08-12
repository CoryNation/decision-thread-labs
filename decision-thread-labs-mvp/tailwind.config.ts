import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dtl-navy': '#1A2E49',
        'dtl-charcoal': '#5A6C80',
        'dtl-ow': '#F5F7FA',
        'dtl-teal': '#20B2AA',
        'dtl-gold': '#D4AF37',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 10px 25px rgba(0,0,0,0.07)',
      }
    },
  },
  plugins: [],
}
export default config
