/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          soft: 'rgba(59, 130, 246, 0.16)',
        },
      },
      boxShadow: {
        card: '0 12px 28px -14px rgba(2, 6, 23, 0.65)',
        pop: '0 20px 45px -18px rgba(2, 6, 23, 0.75)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
