/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      colors: {
        primary: {
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
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.8',
            '[class~="lead"]': {
              color: '#6b7280',
            },
            a: {
              color: '#2563eb',
              textDecoration: 'underline',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            strong: {
              color: '#111827',
              fontWeight: '600',
            },
            'h1, h2, h3, h4, h5, h6': {
              color: '#111827',
              fontWeight: '600',
            },
            h1: {
              fontSize: '2rem',
              marginTop: '0',
              marginBottom: '1rem',
            },
            h2: {
              fontSize: '1.5rem',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h3: {
              fontSize: '1.25rem',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
            },
            code: {
              color: '#374151',
              backgroundColor: '#f3f4f6',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit',
            },
            blockquote: {
              color: '#6b7280',
              borderLeftColor: '#d1d5db',
              borderLeftWidth: '4px',
              paddingLeft: '1rem',
              fontStyle: 'italic',
            },
            'ul > li': {
              paddingLeft: '0.5rem',
            },
            'ol > li': {
              paddingLeft: '0.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}