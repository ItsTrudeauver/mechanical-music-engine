import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // This grabs everything in src
  ],
  theme: {
    extend: {
      colors: {
        'mech-bg': '#0a0a0a',
        'mech-surface': '#171717',
        'mech-border': '#262626',
        'mech-accent': '#e5e5e5',
        'mech-dim': '#525252',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;