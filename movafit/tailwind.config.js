/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // telas baixas (notebook): deixa o login mais compacto
      screens: { short: { raw: '(max-height: 820px)' } },
      colors: {
        // paleta "moova*" (projeto Login Look Dashboard da Gabi): tinta quase preta, lavanda, sálvia, creme e vinho
        ink: { DEFAULT: '#0C0A0E', soft: '#222126', fg: '#F6F1E7' },
        lavanda: { DEFAULT: '#C3AEEC', 200: '#DCD1F4', 100: '#EBE4FA' },
        salvia: { DEFAULT: '#A8CA96', 200: '#D2E5C8', deep: '#376139' },
        vinho: { DEFAULT: '#0C0A0E', 950: '#050406', 900: '#0C0A0E', 800: '#1A181D', 700: '#222126' },
        cereja: { DEFAULT: '#702335', 600: '#5E1C2C' }, // vinho do saldo e dos destaques
        queimado: { DEFAULT: '#C3AEEC', 300: '#DCD1F4' },
        rosa: { DEFAULT: '#C3AEEC', 100: '#DCD1F4', 50: '#EBE4FA' },
        nevoa: '#EBE7E0',
        creme: { DEFAULT: '#F1EFF4', 100: '#E8E5EC', 200: '#DEDAE3' },
        quente: '#FEFCF7',
        tinta: '#100E13',
        oliva: { DEFAULT: '#376139', 100: '#D2E5C8', 600: '#2A4B2C' },
        lima: { DEFAULT: '#A8CA96', 300: '#D2E5C8' },
        // superfícies (nomes antigos mantidos para não quebrar as telas)
        px: {
          ink: '#0C0A0E',
          line: '#0C0A0E',
          panel: '#FEFCF7',
          soft: '#F4F1EA',
          field: '#FEFCF7',
          gold: '#ECC980',
          'gold-soft': '#FAF1DF',
          brown: '#5F5C65',
        },
        // blocos (lavanda, sálvia e creme do projeto)
        pastel: { pink: '#EBE4FA', lilac: '#DCD1F4', peach: '#FAF1DF', mint: '#D2E5C8', yellow: '#FAF1DF', blue: '#EBE4FA' },
      },
      fontFamily: {
        // títulos e números em Fraunces (serifa), texto em Figtree
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        logo: ['"Fraunces Variable"', 'Georgia', 'serif'],
        heading: ['"Fraunces Variable"', 'Georgia', 'serif'],
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        pixel: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', px: '28px' },
      // bordas de 2px em tinta, como no projeto de referência
      borderWidth: { 2: '2px', px2: '2px', px3: '2px' },
      boxShadow: {
        // sombra "deslocada" sólida, como no projeto de referência
        soft: 'none',
        lift: '6px 6px 0 0 #0C0A0E',
        pixel: '4px 4px 0 0 #0C0A0E',
        'pixel-sm': '2px 2px 0 0 #0C0A0E',
        'pixel-press': 'none',
        'pixel-glow': '0 0 0 3px #C3AEEC',
        lavanda: '4px 4px 0 0 #C3AEEC',
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
