import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Black, Yellow (Gold), Red, White (Uganda Flag)
        brand: {
          black: '#000000',
          yellow: '#FFD700',
          red: '#CE1126',
          white: '#ffffff',
        },

        // Yellow/Gold Scale (Primary Accent)
        yellow: {
          50: '#fffef5',
          100: '#fffde6',
          200: '#fff9bf',
          300: '#fff299',
          400: '#ffe766',
          500: '#FFD700',
          600: '#E6C200',
          700: '#B89800',
          800: '#8A7200',
          900: '#5C4C00',
        },

        // Red Scale (Secondary Accent — Uganda Red)
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#CE1126',
          600: '#B80F22',
          700: '#9A0D1C',
          800: '#7C0A16',
          900: '#5E0811',
        },

        // Primary color system (using black as primary)
        primary: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c0c0c0',
          400: '#909090',
          500: '#606060',
          600: '#404040',
          700: '#2a2a2a',
          800: '#1a1a1a',
          900: '#000000',
        },

        // Secondary color system (using yellow/gold as secondary)
        secondary: {
          50: '#fffef5',
          100: '#fffde6',
          200: '#fff9bf',
          300: '#fff299',
          400: '#ffe766',
          500: '#FFD700',
          600: '#E6C200',
          700: '#B89800',
          800: '#8A7200',
          900: '#5C4C00',
        },

        // Accent colors for UI elements
        accent: {
          yellow: {
            50: '#fffef5',
            100: '#fffde6',
            200: '#fff9bf',
            300: '#fff299',
            400: '#ffe766',
            500: '#FFD700',
            600: '#E6C200',
            700: '#B89800',
            800: '#8A7200',
            900: '#5C4C00',
          },
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#CE1126',
            600: '#B80F22',
            700: '#9A0D1C',
            800: '#7C0A16',
            900: '#5E0811',
          },
          black: {
            50: '#f8f8f8',
            100: '#f0f0f0',
            200: '#e0e0e0',
            300: '#c0c0c0',
            400: '#909090',
            500: '#606060',
            600: '#404040',
            700: '#2a2a2a',
            800: '#1a1a1a',
            900: '#000000',
          },
          white: '#ffffff',
        },

        // Neutral grays for backgrounds and text
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },

        // Status colors (semantic)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },

        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },

        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },

      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },

      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'yellow': '0 4px 14px rgba(255, 215, 0, 0.25)',
        'red': '0 4px 14px rgba(206, 17, 38, 0.25)',
        'black': '0 4px 14px rgba(0, 0, 0, 0.25)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #2a2a2a 75%, #000000 100%)',
        'card-pattern': 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)',
        'dark-pattern': 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      },

      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      backdropBlur: {
        xs: '2px',
      },

      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },

      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
}

export default config
