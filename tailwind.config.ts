import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: { // Added fontFamily extension
        sans: ['Montserrat', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pop-in": { // New keyframe for a subtle pop-in effect
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pop-out": { // New keyframe for a subtle pop-out effect
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "bomb-shake": { // New keyframe for bomb shake
          "0%, 100%": { transform: "translateX(0) translateY(0) rotate(0deg)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px) translateY(-5px) rotate(-2deg)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px) translateY(5px) rotate(2deg)" },
        },
        "flash-red": { // New keyframe for red flash
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(255, 0, 0, 0.5)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pop-in": "pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Bouncy pop-in
        "pop-out": "pop-out 0.2s ease-out",
        "bomb-shake": "bomb-shake 0.5s cubic-bezier(.36,.07,.19,.97) both", // Short, intense shake
        "flash-red": "flash-red 0.5s ease-out forwards", // Quick flash
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;