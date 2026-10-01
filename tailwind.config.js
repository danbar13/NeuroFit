/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hc: {
          bg: '#000000',
          card: '#121212',
          yellow: '#FFEA00',
          yellowHover: '#FFE000',
          text: '#FFFFFF',
          border: '#FFEA00',
        },
        senior: {
          warmBg: '#F8F9FA',
          cardBg: '#FFFFFF',
          primary: '#1E3A8A', // Deep soothing navy blue (easy on older eyes)
          primaryHover: '#172554',
          accent: '#0D9488', // Soothing teal
          gentleGreen: '#15803D', // Positive reinforcement
          gentleAmber: '#B45309', // Gentle caution (no harsh reds)
          gentleBlue: '#2563EB',
          textPrimary: '#111827',
          textSecondary: '#374151',
          border: '#D1D5DB'
        }
      },
      minHeight: {
        'touch': '64px',
      },
      minWidth: {
        'touch': '64px',
      },
      fontSize: {
        'senior-sm': ['1.125rem', { lineHeight: '1.75rem' }],
        'senior-base': ['1.25rem', { lineHeight: '2rem' }],
        'senior-lg': ['1.5rem', { lineHeight: '2.25rem' }],
        'senior-xl': ['1.875rem', { lineHeight: '2.5rem' }],
        'senior-2xl': ['2.25rem', { lineHeight: '2.75rem' }],
      }
    },
  },
  plugins: [],
}
