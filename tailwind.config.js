/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // telas baixas (notebook com a janela do navegador menor)
      screens: { short: { raw: '(min-width: 1024px) and (max-height: 760px)' } },
      colors: {
        vinho: { DEFAULT: '#520215', 950: '#22060d', 900: '#3a010f', 800: '#4a1220', 700: '#6b0a22' },
        cereja: { DEFAULT: '#961415', 600: '#7d1011' },
        queimado: { DEFAULT: '#CB757C', 300: '#d99499' },
        rosa: { DEFAULT: '#EFAFB3', 100: '#f8dcde', 50: '#fcefef' },
        nevoa: '#DFD1D1',
        creme: { DEFAULT: '#FBF5EE', 100: '#F6EDE3', 200: '#EFE3D6' },
        quente: '#FFFCF8',
        tinta: '#1f1416',
        oliva: { DEFAULT: '#7A7A4A', 100: '#E6E4CF', 600: '#5f5f37' },
        // tokens do "cozy game": contorno, painéis e cenário
        px: {
          ink: '#2b0910', // contorno pixel (vinho quase preto)
          line: '#4a1220', // borda dos painéis
          panel: '#FFF5F1', // fundo dos painéis
          soft: '#FBE4E4', // painel rosado
          field: '#F6D3D6', // fundo da área principal
          gold: '#E3A548',
          'gold-soft': '#F6D488',
          brown: '#6b3f26',
        },
      },
      fontFamily: {
        logo: ['"Sooky 70s"', '"Arial Rounded MT Bold"', 'system-ui', 'sans-serif'],
        // pixel: títulos, níveis, conquistas e labels especiais; sans: textos, valores e formulários
        pixel: ['"Pixelify Sans"', '"DM Sans Variable"', 'system-ui', 'sans-serif'],
        heading: ['"Pixelify Sans"', '"DM Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"Pixelify Sans"', '"DM Sans Variable"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', px: '10px' },
      borderWidth: { px2: '2px', px3: '3px' },
      boxShadow: {
        soft: '0 1px 2px rgba(82,2,21,0.04), 0 6px 20px -8px rgba(82,2,21,0.12)',
        lift: '0 2px 4px rgba(82,2,21,0.05), 0 14px 30px -12px rgba(82,2,21,0.22)',
        // sombras "pixel": deslocamento duro + leve difusão
        pixel: '0 3px 0 0 #4a1220, 0 8px 18px -10px rgba(43,9,16,0.45)',
        'pixel-sm': '0 2px 0 0 #4a1220',
        'pixel-press': '0 1px 0 0 #4a1220',
        'pixel-glow': '0 3px 0 0 #4a1220, 0 0 0 3px rgba(239,175,179,0.55), 0 10px 22px -10px rgba(43,9,16,0.5)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(0.6)' }, '60%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
        rise: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        sparkle: { '0%': { opacity: 0, transform: 'scale(0.4) rotate(0)' }, '50%': { opacity: 1 }, '100%': { opacity: 0, transform: 'scale(1.3) rotate(40deg)' } },
        wiggle: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        glow: { '0%,100%': { opacity: 0.35 }, '50%': { opacity: 0.95 } },
        twinkle: { '0%,100%': { opacity: 0.25, transform: 'scale(0.7) rotate(0deg)' }, '50%': { opacity: 1, transform: 'scale(1.1) rotate(20deg)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
        'xp-rise': { '0%': { opacity: 0, transform: 'translateY(6px) scale(0.9)' }, '15%': { opacity: 1, transform: 'translateY(0) scale(1.05)' }, '80%': { opacity: 1 }, '100%': { opacity: 0, transform: 'translateY(-18px)' } },
        'level-in': { '0%': { opacity: 0, transform: 'scale(0.6)' }, '60%': { opacity: 1, transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } },
        burst: { '0%': { opacity: 1, transform: 'translate(0,0) scale(1)' }, '100%': { opacity: 0, transform: 'translate(var(--bx), var(--by)) scale(0.4)' } },
        shine: { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(220%)' } },
        // tela de login
        'window-in': { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        sway: { '0%,100%': { transform: 'rotate(-2.5deg)' }, '50%': { transform: 'rotate(2.5deg)' } },
        flicker: { '0%,100%': { opacity: 0.85 }, '42%': { opacity: 1 }, '45%': { opacity: 0.7 }, '48%': { opacity: 0.95 }, '70%': { opacity: 0.8 } },
        neon: { '0%,100%': { opacity: 0.9 }, '50%': { opacity: 0.55 }, '52%': { opacity: 0.9 }, '54%': { opacity: 0.4 }, '56%': { opacity: 0.85 } },
        'city-light': { '0%,38%': { opacity: 0 }, '42%,86%': { opacity: 0.9 }, '90%,100%': { opacity: 0 } },
      },
      animation: {
        pop: 'pop .35s ease-out',
        rise: 'rise .35s ease-out both',
        sparkle: 'sparkle .9s ease-out forwards',
        wiggle: 'wiggle 3s ease-in-out infinite',
        glow: 'glow 4s ease-in-out infinite',
        twinkle: 'twinkle 3.2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        bob: 'bob 0.6s steps(2, jump-none) infinite',
        'xp-rise': 'xp-rise 1.6s ease-out forwards',
        'level-in': 'level-in 0.45s ease-out both',
        burst: 'burst 0.7s ease-out forwards',
        shine: 'shine 2.4s ease-in-out infinite',
        'window-in': 'window-in 0.6s cubic-bezier(.2,.8,.2,1) both',
        sway: 'sway 5s ease-in-out infinite',
        flicker: 'flicker 6s ease-in-out infinite',
        neon: 'neon 7s ease-in-out infinite',
        'city-light': 'city-light 11s steps(1, end) infinite',
      },
    },
  },
  plugins: [],
}
