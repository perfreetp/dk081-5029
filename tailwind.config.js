/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#EAF2FB',
          100: '#D5E5F6',
          200: '#ABCBEF',
          300: '#81B1E5',
          400: '#5797DC',
          500: '#2D7DD2',
          600: '#1E56A0',
          700: '#174078',
          800: '#0F2B50',
          900: '#081528',
        },
        success: {
          50: '#EFFBF4',
          100: '#DFF7E8',
          200: '#BFEFD1',
          300: '#9FE6BA',
          400: '#7FDEA3',
          500: '#5FD68C',
          600: '#22A06B',
          700: '#197850',
          800: '#115036',
          900: '#08281B',
        },
        warning: {
          50: '#FEF8EC',
          100: '#FEF1D9',
          200: '#FDE3B3',
          300: '#FCD58D',
          400: '#FBC767',
          500: '#FAB941',
          600: '#F59E0B',
          700: '#B87608',
          800: '#7A4F05',
          900: '#3D2703',
        },
        danger: {
          50: '#FDECEC',
          100: '#FBD9D9',
          200: '#F7B3B3',
          300: '#F38D8D',
          400: '#EF6767',
          500: '#EB4141',
          600: '#DC2626',
          700: '#A51D1D',
          800: '#6E1313',
          900: '#370A0A',
        },
      },
      fontFamily: {
        sans: [
          '"Source Han Sans CN"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};
