import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        plum: {
          50: '#F2F9F7',
          100: '#E5F3F0',
          200: '#CCE7E1',
          300: '#9ECFC5',
          400: '#67B7A5', // Seafoam Accent
          500: '#429A87',
          600: '#2D7D6D',
          700: '#216155',
          800: '#1C4F46',
          900: '#164E63', // Primary Ocean Teal
          950: '#0E3342', // Deep Ocean
        },
        teal: {
          50: '#F2F9F7',
          100: '#E5F3F0',
          200: '#CCE7E1',
          300: '#9ECFC5',
          400: '#67B7A5', // Seafoam Accent
          500: '#429A87',
          600: '#2D7D6D',
          700: '#216155',
          800: '#1C4F46',
          900: '#164E63', // Primary Ocean Teal
          950: '#0E3342', // Deep Ocean
        },
        seafoam: {
          50: '#F7FCFA',
          100: '#EFF8F5',
          200: '#DBF0EB',
          300: '#BFE5DC',
          400: '#67B7A5', // Seafoam Accent
          500: '#4DA290',
          600: '#3D8576',
          700: '#346A5F',
          800: '#2E554D',
          900: '#284640',
        },
        ivory: {
          50: '#FDFBF7',
          100: '#FAF8F3',
          200: '#F6F3EA', // Warm Ivory Background
          300: '#EFE9DC',
          400: '#E2D9C5',
          500: '#C5B79C',
        },
        lavender: {
          50: '#F7FCFA',
          100: '#EFF8F5',
          200: '#DBF0EB',
          300: '#BFE5DC',
          400: '#67B7A5',
          500: '#4DA290',
          600: '#3D8576',
          700: '#346A5F',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
