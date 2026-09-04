import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#FF6B00', dark: '#E55E00', light: '#FFF3E8' },
        sand: '#FAF7F2',
        ink: { DEFAULT: '#1A1A1A', muted: '#8E8E93', soft: '#636366' },
        line: '#E5E5EA',
      },
      fontFamily: {
        display: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
export default config
