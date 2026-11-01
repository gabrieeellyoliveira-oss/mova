/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // paleta do MOVA (referência "Visão geral"): ameixa/vinho suave + lilases claros
        vinho: { DEFAULT: '#5B2448', 950: '#2A1022', 900: '#3E1631', 800: '#4A1C3B', 700: '#6E2E58' },
        cereja: { DEFAULT: '#6E2E58', 600: '#5B2448' }, // ação principal
        queimado: { DEFAULT: '#B58AA8', 300: '#CDAFC4' },
        rosa: { DEFAULT: '#E9D7E5', 100: '#F2E7EF', 50: '#F9F4F8' },
        nevoa: '#E7DEE5',
        creme: { DEFAULT: '#F7F2F6', 100: '#F1EAF0', 200: '#E9E0E8' },
        quente: '#FFFFFF',
        tinta: '#2B1A26',
        oliva: { DEFAULT: '#5E9474', 100: '#E2F1E8', 600: '#3F6E52' },
        // superfícies (nomes antigos mantidos para não quebrar as telas)
        px: {
          ink: '#2B1A26',
          line: '#EDE4EB', // borda bem suave dos cards
          panel: '#FFFFFF',
          soft: '#F6EFF4',
          field: '#F7F2F6', // fundo da página
          gold: '#E8B04B',
          'gold-soft': '#FBEBC4',
          brown: '#8A6F5C',
        },
        // blocos pastel ("Quick glance")
        pastel: { pink: '#FADDE6', lilac: '#E4DEF7', peach: '#FCE4D0', mint: '#D8F0E4', yellow: '#FFF1C4', blue: '#DCEAFA' },
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
        soft: '0 1px 2px rgba(60,20,50,0.04), 0 8px 24px -12px rgba(60,20,50,0.14)',
        lift: '0 2px 4px rgba(60,20,50,0.05), 0 18px 36px -16px rgba(60,20,50,0.22)',
        // nomes antigos → sombras suaves
        pixel: '0 1px 2px rgba(60,20,50,0.04), 0 8px 24px -14px rgba(60,20,50,0.16)',
        'pixel-sm': '0 1px 2px rgba(60,20,50,0.06)',
        'pixel-press': 'none',
        'pixel-glow': '0 0 0 3px rgba(181,138,168,0.25), 0 12px 28px -14px rgba(60,20,50,0.25)',
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
