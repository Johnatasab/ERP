/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',   // <-- linha obrigatória
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};