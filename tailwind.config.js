/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "Roboto", "system-ui", "sans-serif"],
      heading: ["Inter", "Roboto", "system-ui", "sans-serif"],
      mono: "ui-monospace, Consolas, monospace",
    },
    extend: {
      colors: {
        text: 'var(--text)',
        'text-h': 'var(--text-h)',
        bg: 'var(--bg)',
        border: 'var(--border)',
        'code-bg': 'var(--code-bg)',
        accent: 'var(--accent)',
        'accent-bg': 'var(--accent-bg)',
        'accent-border': 'var(--accent-border)',
        'social-bg': 'var(--social-bg)',
      },
      fontSize: {
        base: "18px",
      },
      lineHeight: {
        base: "145%",
      },
      letterSpacing: {
        base: "0.18px",
      },
      boxShadow: {
        default: 'var(--shadow)',
      },

    },
  },
  plugins: [],
}
