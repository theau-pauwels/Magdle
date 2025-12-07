/** @type {import('tailwindcss').Config} */
export default {
  // C'est cette ligne qui manquait et qui causait l'avertissement :
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  
  theme: {
    extend: {
      // On ajoute ici les animations utilisées dans le composant React (Game.jsx)
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'flip-in': 'flipIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        flipIn: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0)', opacity: '1' },
        }
      },
    },
  },
  plugins: [],
}