import type { Config } from "tailwindcss"

const config = {
    darkMode: "class",
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
            colors: {
                "accent-new": "#268A40",
                "status-blue-0": "#8ed0ff",
                "status-blue-bg": "#E7F3FB",
                "status-blue-text": "#264E76",
                "status-blue-border": "#B3D8F2",
                "status-green-0": "#EFFDF6",
                "status-green-bg": "#E5F7EB",
                "status-green-text": "#157F3D",
                "status-green-border": "#B9E7CA",
                "status-yellow-bg": "#FFF9D9",
                "status-yellow-text": "#8A5A00",
                "status-yellow-border": "#FFEEAA",
                "status-red-bg": "#FCE7E7",
                "status-red-text": "#8F1D1D",
                "status-red-border": "#F5B5B5",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
