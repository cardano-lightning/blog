import * as colors from 'tailwindcss/colors';

// This is from docs nextra theme.
// const makePrimaryColor =
//   l =>
//   ({ opacityValue }) => {
//     return (
//       `hsl(var(--nextra-primary-hue) var(--nextra-primary-saturation) ${l}%` +
//       (opacityValue ? ` / ${opacityValue})` : ')')
//     )
//   }

/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'nx-',
  content: [
    "./theme/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./theme.config.jsx"
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      gray: colors.gray,
      slate: colors.slate,
      neutral: colors.neutral,
      red: colors.red,
      orange: colors.orange,
      blue: colors.blue,
      yellow: colors.yellow,
      // This was overwritten by blog theme
      // primary: {
      //   50: makePrimaryColor(97),
      //   100: makePrimaryColor(94),
      //   200: makePrimaryColor(86),
      //   300: makePrimaryColor(77),
      //   400: makePrimaryColor(66),
      //   500: makePrimaryColor(50),
      //   600: makePrimaryColor(45),
      //   700: makePrimaryColor(39),
      //   750: makePrimaryColor(35),
      //   800: makePrimaryColor(32),
      //   900: makePrimaryColor(24)
      // }
      primary: colors.blue
    },
    extend: {
      colors: {
        dark: '#111'
      },
      fontFamily: {
        'cardano': ['Trueno Semibold', 'sans-serif'],
      },
      typography: theme => ({
        dark: {
          css: {
            color: theme('colors.gray[300]'),
            '[class~="lead"]': { color: theme('colors.gray[400]') },
            a: { color: theme('colors.gray[100]') },
            strong: { color: theme('colors.gray[100]') },
            'ul > li::before': { backgroundColor: theme('colors.gray[700]') },
            hr: { borderColor: theme('colors.gray[800]') },
            blockquote: {
              color: theme('colors.gray[100]'),
              borderLeftColor: theme('colors.gray[800]')
            },
            h1: { color: theme('colors.gray[100]') },
            h2: { color: theme('colors.gray[100]') },
            h3: { color: theme('colors.gray[100]') },
            h4: { color: theme('colors.gray[100]') },
            code: { color: theme('colors.gray[100]') },
            'a code': { color: theme('colors.gray[100]') },
            pre: {
              color: theme('colors.gray[200]'),
              backgroundColor: theme('colors.gray[800]')
            },
            thead: {
              color: theme('colors.gray[100]'),
              borderBottomColor: theme('colors.gray[700]')
            },
            'tbody tr': { borderBottomColor: theme('colors.gray[800]') }
          }
        }
      })
    }
  },
  variants: {
    extend: {
      typography: ['dark']
    }
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: ['class', 'html[class~="dark"]']
}
