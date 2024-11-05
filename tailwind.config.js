/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Define your custom fonts
        sans: ['Roboto', 'sans-serif'], // Add Roboto as the default sans font
        serif: ["Cedarville Cursive"], // Example for a serif font
        custom: ['"Batman"'], // Add your custom font name here
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}