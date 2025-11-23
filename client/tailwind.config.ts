import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a855f7',
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        secondary: {
          DEFAULT: '#ec4899',
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
        danger: {
          DEFAULT: '#f43f5e',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        warning: {
          DEFAULT: '#fbbf24',
          500: '#fbbf24',
          600: '#f59e0b',
          700: '#d97706',
        },
        success: {
          DEFAULT: '#10b981',
          500: '#10b981',
          600: '#059669',
        },
        info: {
          DEFAULT: '#3b82f6',
          500: '#3b82f6',
          600: '#2563eb',
        },
        dark: {
          primary: '#0d0d1a',
          secondary: '#1a1a2e',
          card: '#1f1f35',
          border: '#2d2d44',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #a855f7, #ec4899)',
        'gradient-secondary': 'linear-gradient(135deg, #3b82f6, #6366f1)',
        'gradient-dark': 'linear-gradient(135deg, #0d0d1a, #1a1a2e)',
        'gradient-card': 'linear-gradient(135deg, #1f1f35, #1a1a2e)',
        'gradient-premium': 'linear-gradient(135deg, #a855f7, #ec4899, #fbbf24)',
      },
      boxShadow: {
        'neon-purple': '0 0 30px rgba(168, 85, 247, 0.5)',
        'neon-pink': '0 0 30px rgba(236, 72, 153, 0.5)',
        'neon-blue': '0 0 30px rgba(59, 130, 246, 0.5)',
        'premium': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(168, 85, 247, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config
