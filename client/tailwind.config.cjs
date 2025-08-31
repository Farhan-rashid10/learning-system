// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        admin: '#ef4444', // red-500
        mentor: '#3b82f6', // blue-500
        student: '#22c55e' // green-500
      }
    }
  },
  plugins: []
};

