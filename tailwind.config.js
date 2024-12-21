/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        background: '#F3F4F6',
        dark: {
          100: '#1F2937',
          200: '#111827',
          300: '#0F172A',
          400: '#0D1117'
        },
        accent: {
          blue: '#60A5FA',
          purple: '#8B5CF6',
          pink: '#EC4899'
        }
      },
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
