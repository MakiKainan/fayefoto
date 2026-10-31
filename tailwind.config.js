/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        p5: {
          red: '#E5191C',
          'red-dark': '#99000A',
          black: '#0F0F0F',
          white: '#FDFDFD',
          blue: '#2F6BFF',
          gold: '#FFEA00',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Anton', 'Bebas Neue', 'Impact', 'sans-serif'],
        p5: ['Anton', 'Bebas Neue', 'Impact', 'Outfit', 'sans-serif'],
      },
      animation: {
        'flash': 'flash 400ms ease-out forwards',
        'fadeIn': 'fadeIn 200ms ease-out',
        'p5-pop': 'p5pop 0.9s cubic-bezier(0.2, 1.4, 0.4, 1) both',
        'p5-slide': 'p5slide 280ms cubic-bezier(0.2, 1.2, 0.4, 1) both',
        'p5-spin-slow': 'spin 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        flash: {
          '0%': { opacity: '0.9' },
          '100%': { opacity: '0' }
        },
        p5pop: {
          '0%': { transform: 'scale(2.4) rotate(-18deg)', opacity: '0' },
          '35%': { transform: 'scale(0.92) rotate(-6deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-8deg)', opacity: '1' }
        },
        p5slide: {
          '0%': { transform: 'translateX(-40px) skewX(-12deg)', opacity: '0' },
          '100%': { transform: 'translateX(0) skewX(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
