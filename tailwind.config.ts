import type { Config } from 'tailwindcss';

// KO-SA Beach Resort, redesign 2026.
// Palette sampled directly from the Ko-Sa Beach Brand Guide (colour page):
//   Teal      #007C9D  the sea. Primary brand colour.
//   Forest    #2E5339  palms and shade. Body text on light grounds.
//   Coral     #E57355  sunset. Accent, used sparingly.
//   Sand      #EEDDC2  the beach. Warm ground and the wave band.
//   Cream     #F8F7F1  morning light. Page ground.
//   Sunshine  #F4B342  midday sun. Small highlights only.
// Every other value here is a tint or shade of those six.
// Legacy aliases at the bottom keep the admin dashboard compiling unchanged.

const teal = {
  DEFAULT: '#007C9D',
  50: '#E5F2F5',
  100: '#CCE5EC',
  200: '#99CBD8',
  300: '#66B0C4',
  400: '#3396B1',
  500: '#007C9D',
  600: '#00657F',
  700: '#004D61',
  800: '#003644',
  900: '#001F27',
};
const forest = {
  DEFAULT: '#2E5339',
  50: '#EAEEEB',
  100: '#D5DDD7',
  300: '#829887',
  500: '#2E5339',
  700: '#213C29',
  900: '#142519',
};
const coral = {
  DEFAULT: '#E57355',
  50: '#FCEEEA',
  100: '#F9DCD4',
  300: '#EFA996',
  400: '#EA8E76',
  500: '#E57355',
  600: '#CF5A3C',
  700: '#A2432C',
};
const sand = {
  DEFAULT: '#EEDDC2',
  50: '#FBF7F0',
  100: '#F6EEE0',
  200: '#EEDDC2',
  300: '#E3C9A0',
  400: '#D5B07A',
  light: '#F6EEE0',
};
const cream = { DEFAULT: '#F8F7F1', 50: '#FDFCF9', 100: '#F8F7F1', 200: '#EFEDE3' };
const sunshine = {
  DEFAULT: '#F4B342',
  50: '#FEF6E6',
  100: '#FCE8C0',
  300: '#F7C973',
  400: '#F6BE5A',
  500: '#F4B342',
  600: '#D9962A',
  700: '#A7701A',
};

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        teal,
        forest,
        coral,
        sand,
        cream,
        sunshine,
        night: { DEFAULT: '#032A36', deep: '#021C25' },

        primary: { DEFAULT: teal[500], dark: teal[700], foreground: cream.DEFAULT },
        secondary: { DEFAULT: coral[500], dark: coral[700], foreground: cream.DEFAULT },
        accent: { DEFAULT: sunshine[500], dark: sunshine[700], foreground: forest[900] },
        muted: { DEFAULT: sand[200], foreground: forest[500] },
        cta: { DEFAULT: coral[500], light: coral[400] },
        card: { DEFAULT: cream.DEFAULT, foreground: forest[500] },
        border: { DEFAULT: sand[300] },
        ring: { DEFAULT: teal[500] },

        // Legacy aliases (admin + any untouched markup)
        umber: { DEFAULT: forest[500], 50: cream.DEFAULT, 100: sand[200], 500: forest[500], 700: forest[700], 900: forest[900] },
        brown: { DEFAULT: coral[700], 500: coral[700], 700: '#7A311F' },
        gold: { DEFAULT: sunshine[500], 500: sunshine[500], 600: sunshine[600] },
        'warm-grey': { DEFAULT: sand[300] },
        'bg-orange': { DEFAULT: sand[100] },
      },
      fontFamily: {
        // Two families only. Fraunces (soft, slightly wonky optical serif) for
        // display and voice; Figtree (friendly geometric sans) for everything else.
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
        // Legacy names mapped onto the new pair so older markup stays in-brand.
        playfair: ['"Fraunces Variable"', 'Georgia', 'serif'],
        belleza: ['"Fraunces Variable"', 'Georgia', 'serif'],
        beth: ['"Fraunces Variable"', 'Georgia', 'serif'],
        raleway: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
        opensans: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
        poppins: ['"Figtree Variable"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display scale (modular, ratio ~1.333, fluid)
        'display-2xl': ['clamp(3.75rem, 12.5vw, 13.5rem)', { lineHeight: '0.86', letterSpacing: '-0.035em' }],
        'display-xl': ['clamp(3rem, 8.5vw, 8.5rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 5.75rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2rem, 4.2vw, 3.75rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.5rem, 2.6vw, 2.25rem)', { lineHeight: '1.12', letterSpacing: '-0.012em' }],
        lede: ['clamp(1.125rem, 1.5vw, 1.375rem)', { lineHeight: '1.55' }],
      },
      letterSpacing: {
        tracked: '0.14em',
        'tracked-sm': '0.06em',
      },
      maxWidth: {
        'screen-2xl': '1536px',
        'screen-3xl': '1920px',
        prose: '64ch',
        measure: '34rem',
      },
      borderRadius: {
        pebble: '2.25rem',
        shell: '999px 999px 2.25rem 2.25rem',
      },
      transitionTimingFunction: {
        tide: 'cubic-bezier(0.22, 1, 0.36, 1)',
        breath: 'cubic-bezier(0.45, 0, 0.55, 1)',
      },
      animation: {
        'tide-drift': 'tideDrift 38s linear infinite',
        'tide-drift-slow': 'tideDrift 64s linear infinite',
        'tide-drift-rev': 'tideDriftRev 52s linear infinite',
        breathe: 'breathe 8s cubic-bezier(0.45, 0, 0.55, 1) infinite',
        marquee: 'marquee 60s linear infinite',
        twinkle: 'twinkle 5s ease-in-out infinite',
      },
      keyframes: {
        tideDrift: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        tideDriftRev: { '0%': { transform: 'translateX(-50%)' }, '100%': { transform: 'translateX(0)' } },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.55' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        twinkle: { '0%, 100%': { opacity: '0.25' }, '50%': { opacity: '0.9' } },
      },
    },
  },
  plugins: [],
};

export default config;
