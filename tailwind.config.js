/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#EF451C',      
        'dark-title': '#363636',  
        'gray-text': '#7c848a',     
        'custom-border': '#3636361a', 
      },
      borderRadius: {
        'custom': '10px', 
      },
      fontSize: {
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '56': '56px',
        '64': '64px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), 
  ],
}