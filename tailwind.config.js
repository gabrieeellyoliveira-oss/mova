/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vinho: { DEFAULT: '#520215', 900: '#3a010f', 700: '#6b0a22' },
        cereja: { DEFAULT: '#961415', 600: '#7d1011' },
        queimado: { DEFAULT: '#CB757C', 300: '#d99499' },
        rosa: { DEFAULT: '#EFAFB3', 100: '#f8dcde', 50: '#fcefef' },
        nevoa: '#DFD1D1',
        creme: { DEFAULT: '#FBF5EE', 100: '#F6EDE3', 200: '#EFE3D6' },
        quente: '#FFFCF8',
        tinta: '#1f1416',
        oliva: { DEFAULT: '#7A7A4A', 100: '#E6E4CF', 600: '#5f5f37' },
      },
      fontFamily: {
        display: ['Modak', '"Arial Rounded MT Bold"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(82,2,21,0.04), 0 6px 20px -8px rgba(82,2,21,0.12)',
        lift: '0 2px 4px rgba(82,2,21,0.05), 0 14px 30px -12px rgba(82,2,21,0.22)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(0.6)' }, '60%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
        rise: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        sparkle: { '0%': { opacity: 0, transform: 'scale(0.4) rotate(0)' }, '50%': { opacity: 1 }, '100%': { opacity: 0, transform: 'scale(1.3) rotate(40deg)' } },
        wiggle: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
      },
      animation: {
        pop: 'pop .35s ease-out',
        rise: 'rise .35s ease-out both',
        sparkle: 'sparkle .9s ease-out forwards',
        wiggle: 'wiggle 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
