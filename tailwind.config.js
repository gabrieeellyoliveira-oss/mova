/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // paleta do MOVA (nov/2026): Deep Espresso + Petal Reverie + Ivory Hearth, minimalista
        vinho: { DEFAULT: '#3E2723', 950: '#1F1311', 900: '#2A1A17', 800: '#33201D', 700: '#5A3C36' },
        cereja: { DEFAULT: '#3E2723', 600: '#33201D' }, // destaque (gráficos, progresso)
        queimado: { DEFAULT: '#D99AAE', 300: '#EBC3CF' },
        rosa: { DEFAULT: '#F4C9D6', 100: '#F9E1E8', 50: '#FCF0F3' },
        nevoa: '#EAE3D6',
        creme: { DEFAULT: '#F5F0E6', 100: '#EFE8DA', 200: '#E6DDCB' },
        quente: '#FFFDF9',
        tinta: '#3E2723',
        oliva: { DEFAULT: '#6E8B6A', 100: '#E6EDE1', 600: '#4F6A4C' },
        lima: { DEFAULT: '#F4C9D6', 300: '#F9E1E8' },
        // superfícies (nomes antigos mantidos para não quebrar as telas)
        px: {
          ink: '#3E2723',
          line: '#E8DFD0',
          panel: '#FFFDF9',
          soft: '#F3EDE2',
          field: '#FAF7F1',
          gold: '#F4C9D6',
          'gold-soft': '#FCF0F3',
          brown: '#8A6F5C',
        },
        // blocos suaves (todos dentro da paleta: rosa e marfim)
        pastel: { pink: '#F9E1E8', lilac: '#F3ECE0', peach: '#F7E6E0', mint: '#EEF0E6', yellow: '#F6EFE2', blue: '#F1EDE6' },
      },
      fontFamily: {
        // tudo em DM Sans; os nomes antigos apontam para ela
        logo: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        pixel: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        heading: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', px: '20px' },
      // bordas finas: as telas usam border-2, que aqui vira 1px
      borderWidth: { 2: '1px', px2: '1px', px3: '2px' },
      boxShadow: {
        soft: '0 1px 2px rgba(62,39,35,0.04), 0 8px 24px -12px rgba(62,39,35,0.14)',
        lift: '0 2px 4px rgba(62,39,35,0.05), 0 18px 36px -16px rgba(62,39,35,0.22)',
        // nomes antigos → sombras suaves
        pixel: '0 1px 2px rgba(62,39,35,0.04), 0 8px 24px -14px rgba(62,39,35,0.16)',
        'pixel-sm': '0 1px 2px rgba(62,39,35,0.06)',
        'pixel-press': 'none',
        'pixel-glow': '0 0 0 3px rgba(244,201,214,0.6), 0 12px 28px -14px rgba(62,39,35,0.25)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(0.6)' }, '60%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
        rise: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        sparkle: { '0%': { opacity: 0, transform: 'scale(0.4) rotate(0)' }, '50%': { opacity: 1 }, '100%': { opacity: 0, transform: 'scale(1.3) rotate(40deg)' } },
        wiggle: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        glow: { '0%,100%': { opacity: 0.35 }, '50%': { opacity: 0.95 } },
        twinkle: { '0%,100%': { opacity: 0.25, transform: 'scale(0.7) rotate(0deg)' }, '50%': { opacity: 1, transform: 'scale(1.1) rotate(20deg)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        shine: { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(220%)' } },
      },
      animation: {
        pop: 'pop .35s ease-out',
        rise: 'rise .35s ease-out both',
        sparkle: 'sparkle .9s ease-out forwards',
        wiggle: 'wiggle 3s ease-in-out infinite',
        glow: 'glow 4s ease-in-out infinite',
        twinkle: 'twinkle 3.2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shine: 'shine 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
