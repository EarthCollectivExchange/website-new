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

      spacing: {
        /* Golden-ratio / Phi spacing scale: 4 / 6 / 10 / 16 / 26 / 42 / 68 */
        'phi-1': '0.25rem',    /*  4px */
        'phi-2': '0.375rem',   /*  6px */
        'phi-3': '0.625rem',   /* 10px */
        'phi-4': '1rem',       /* 16px */
        'phi-5': '1.625rem',   /* 26px */
        'phi-6': '2.625rem',   /* 42px */
        'phi-7': '4.25rem',    /* 68px */

        /* Legacy Fibonacci compat */
        'fib-1': '0.5rem',     /*  8px */
        'fib-2': '0.8125rem',  /* 13px */
        'fib-3': '1.3125rem',  /* 21px */
        'fib-4': '2.125rem',   /* 34px */
        'fib-5': '3.4375rem',  /* 55px */
        'fib-6': '5.5625rem',  /* 89px */

        /* Touch targets */
        'touch': '2.75rem',    /* 44px minimum touch target */
        'btn':   '2.625rem',   /* 42px desktop button */
        'btn-lg': '3rem',      /* 48px mobile button */
      },

      width: {
        /* Golden ratio columns */
        'phi-minor': '38.2%',
        'phi-major': '61.8%',
        'touch': '2.75rem',
      },

      height: {
        'touch': '2.75rem',
        'btn':   '2.625rem',
        'btn-lg': '3rem',
      },

      minHeight: {
        'touch': '2.75rem',
        'btn':   '2.625rem',
        'btn-lg': '3rem',
      },

      minWidth: {
        'touch': '2.75rem',
      },

      maxWidth: {
        'phi-panel':  '38.2%',
        'phi-drawer': '28rem',   /* 448px — drawer max width */
        'msg':        '72%',     /* message bubble max */
        'msg-sm':     '85%',     /* message bubble max on mobile */
      },

      borderRadius: {
        /* Phi radius scale */
        'phi-xs': '0.25rem',    /*  4px */
        'phi-sm': '0.375rem',   /*  6px */
        'phi':    '0.625rem',   /* 10px */
        'phi-md': '1rem',       /* 16px */
        'phi-lg': '1.625rem',   /* 26px */
        'phi-xl': '2.625rem',   /* 42px */

        /* Shadcn defaults */
        lg: 'var(--radius)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },

      fontSize: {
        /* Base is 16px (1rem). Scale down for captions/labels only. */
        'label':  ['0.6875rem', { lineHeight: '1rem',    letterSpacing: '0.03em' }],  /* 11px */
        'caption':['0.75rem',   { lineHeight: '1.125rem' }],                           /* 12px */
        'body-sm':['0.875rem',  { lineHeight: '1.375rem' }],                           /* 14px */
        'body':   ['1rem',      { lineHeight: '1.5rem'   }],                           /* 16px */
        'title':  ['1.125rem',  { lineHeight: '1.5rem',   fontWeight: '600' }],        /* 18px */
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
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'step-enter': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'bubble-tap': {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        'progress-fill': {
          from: { width: '0%' },
          to:   { width: '100%' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'sheet-up': {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'step-enter':      'step-enter 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'bubble-tap':      'bubble-tap 0.18s ease-in-out',
        'progress-fill':   'progress-fill 0.3s ease-in-out forwards',
        'fade-in':         'fade-in 0.20s ease-out both',
        'slide-up':        'slide-up 0.24s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right':  'slide-in-right 0.26s cubic-bezier(0.16,1,0.3,1) both',
        'sheet-up':        'sheet-up 0.28s cubic-bezier(0.16,1,0.3,1) both',
      },

      boxShadow: {
        'card':     '0 1px 3px hsl(168 30% 10% / 0.04), 0 4px 16px hsl(168 30% 10% / 0.04)',
        'elevated': '0 2px 8px hsl(168 30% 10% / 0.06), 0 8px 24px hsl(168 30% 10% / 0.05)',
        'overlay':  '0 8px 40px hsl(168 30% 10% / 0.14)',
        'pill':     '0 1px 3px hsl(168 30% 10% / 0.06)',
        'nature':   '0 2px 16px hsl(168 30% 20% / 0.07), 0 8px 32px hsl(42 55% 50% / 0.04)',
        'nature-lg':'0 4px 32px hsl(168 30% 20% / 0.10), 0 16px 48px hsl(42 55% 50% / 0.06)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
