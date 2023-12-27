/* eslint-disable comma-dangle */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      lightBckg: '#F9F9F9',
      lightExtraBckg: '#FFFFFF',
      lightText: '#1C1C1C',
      whiteText: '#FFFFFF',
      lightTitle: '#414141',
      lightParagraph: '#494949',
      softGrey: '#9B9B9B',
      extraSoftGrey: '#D7D7D7',
      hoverExtraSoftGrey: '#F5F5F5',
      borderSoftGrey: '#E8E8E8',
      pink: '#DF437E',
      orange: '#EB996E',
      green: '#B5DC7E',
      aqua: '#71CEBD',
      purple: '#685FD3',
      error: '#D11111',
      darkBckg: '#2E364C',
      darkExtraBckg: '#212738',
      darkSoftGrey: '#BCD4DE'
    },
    fontFamily: {
    },
    animation: {
      entryImage: 'entryImage 1s ease-out forwards',
      taskEntry: 'taskEntry 1s ease-out',
    },
    keyframes: {
      entryImage: {
        '0%': { transform: 'scale(1)' },
        '100%': { transform: 'scale(1.2)' }
      },
      taskEntry: {
        '0%': { transform: 'translateY(20px)', opacity: 0 },
        '100%': { transform: 'translateY(0)', opacity: 1 }
      }
    },
    extend: {
      boxShadow: {
        cardTask: '0px 0px 10px 2px rgba(0, 0, 0, 0.06)'
      },
    },
  },
  plugins: [],
}
