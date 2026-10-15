import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        dm: ['var(--font-dm)', 'sans-serif'],
      },
      colors: {
        ink: '#0D0D0D',
        'ink-2': '#3A3A3A',
        muted: '#7A7A7A',
        surface: '#F5F3EF',
        card: '#FFFFFF',
        accent: '#E8531A',
        'accent-2': '#FF7A45',
        green: '#1A7A4A',
        'green-l': '#E8F5EE',
        blue: '#1A3D7A',
        'blue-l': '#E8EEFA',
      },
      spacing: {
        'nav-height': '60px',
      },
      boxShadow: {
        'sm-subtle': '0 2px 8px rgba(0,0,0,0.04)',
        'md-subtle': '0 4px 20px rgba(232,83,26,0.08)',
        'lg-subtle': '0 20px 60px rgba(0,0,0,0.08)',
      },
      borderColor: {
        DEFAULT: 'rgba(0,0,0,0.09)',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s infinite',
        'bounce-light': 'bounce-light 1.2s infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.3)' },
        },
        'bounce-light': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
