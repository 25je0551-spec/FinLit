/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          navy: '#0c2340',
          navyMuted: '#243b55',
          slate: '#526880',
          lightSlate: '#8598aa',
          teal: '#007a82',
          tealHover: '#00676e',
          tealLight: '#eef8f8',
          tealTint: '#e0f3f4',
          cardBg: '#ffffff',
          cardSurface: '#f4f7fb',
          cardSurfaceAlt: '#eef4f9',
          cardBorder: '#dce5ee',
          cardBorderHover: '#b8cddc',
          btnSecondary: '#f0f5fa',
          btnSecondaryHover: '#e3ecf4',
          green: '#10b981',
          coral: '#e53e3e',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'cardSm': '14px',
        'btn': '12px',
        'input': '12px',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(15, 35, 65, 0.03)',
        'card': '0 8px 30px rgba(15, 35, 65, 0.06)',
        'modal': '0 16px 40px rgba(15, 35, 65, 0.12)',
        'dialog': '0 20px 48px rgba(15, 35, 65, 0.16)',
      }
    },
  },
  plugins: [],
}
