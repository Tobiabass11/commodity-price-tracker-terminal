import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: 'var(--color-bg)',
          panel: 'var(--color-panel)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          gain: 'var(--color-gain)',
          loss: 'var(--color-loss)',
          amber: 'var(--color-amber)'
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular']
      }
    }
  },
  plugins: []
};

export default config;
