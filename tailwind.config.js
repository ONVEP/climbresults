/** @type {import('tailwindcss').Config} */
export default {
  content: ['./resources/**/*.edge', './resources/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'cg-background': '#02273f',
        'cg-accent': '#f2cc85',
        'cg-light-blue': '#0383bb',
        'cg-neutral-dark': '#5a7184',
        'cg-neutral-darker': '#284462',
      },
      fontFamily: {
        bebas: ['Bebas Kai'],
      },
    },
  },
  plugins: [],
}
