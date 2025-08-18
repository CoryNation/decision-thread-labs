// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Teal Primary System
        primary: {
          DEFAULT: '#006A60',
          50: '#F0FDFA',
          100: '#C5F7F0',
          200: '#9FF2E6',
          300: '#66E4D1',
          400: '#2DD4BF',
          500: '#006A60',
          600: '#005A52',
          700: '#004B44',
          800: '#003B36',
          900: '#00201C',
        },
        
        // Legacy DTL Colors (for compatibility)
        'dtl-teal': '#006A60',
        'dtl-navy': '#1e293b',
        'dtl-charcoal': '#64748b',
        
        // Sticky Note Colors
        sticky: {
          decision: '#FFF7B3',
          data: '#DCFCE7',
          opportunity: '#CDE3FF',
          choice: '#F6E7B2',
        },
        
        // Enhanced Slate Scale
        slate: {
          25: '#FCFCFD',
          50: '#F8FAFC',
          100: '#F1F5F9',
          150: '#E8F0F7',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          850: '#172033',
          900: '#0F172A',
          950: '#020617',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
      },
      
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(0, 106, 96, 0.15)',
        'material': '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'material-lg': '0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 5px 2px rgba(0, 0, 0, 0.15)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
