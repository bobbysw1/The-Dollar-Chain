import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, friendly, Ecosia-inspired palette
        ink: "#16241D",        // deep warm green-black for text
        accent: "#0E9F6E",     // fresh community green
        surface: "#F3EFE6",    // warm cream tint for cards/sections
        muted: "#5F6B62",      // warm grey-green secondary text
        border: "#E7E0D2",     // soft warm border
        success: "#16A34A",
        danger: "#DC2626",
        cream: "#FBF8F1",      // page background
        // tints used around the app (replacing emerald-* where helpful)
        emerald: {
          50: "#ECFBF3",
          100: "#D3F5E1",
          200: "#A8E9C5",
          300: "#6FD7A3",
          400: "#37BE80",
          500: "#13A571",
          600: "#0E9F6E",
          700: "#0A7E57",
          800: "#0A6346",
          900: "#0A4F3A",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "22px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(22, 36, 29, 0.05), 0 8px 24px rgba(22, 36, 29, 0.04)",
        lift: "0 4px 14px rgba(22, 36, 29, 0.08), 0 12px 32px rgba(22, 36, 29, 0.06)",
      },
      maxWidth: {
        column: "680px",
      },
      backgroundImage: {
        "flow-warm": "linear-gradient(135deg, #ECFBF3 0%, #E6F6EC 35%, #FBF8F1 70%, #FDF4E8 100%)",
        "flow-green": "linear-gradient(120deg, #0E9F6E 0%, #13A571 50%, #0A7E57 100%)",
        "flow-soft": "radial-gradient(80% 120% at 0% 0%, #D3F5E1 0%, transparent 50%), radial-gradient(70% 100% at 100% 0%, #FDF0DE 0%, transparent 45%)",
      },
    },
  },
  plugins: [],
};
export default config;
