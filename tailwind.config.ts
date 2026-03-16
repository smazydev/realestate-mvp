import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#FFF0E6",
          "active-bg": "#FFDCC8",
          "active-border": "#E00000",
          text: "#333333",
          "text-muted": "#6B7280",
          "dark-bg": "#221E1C",
          "dark-active-bg": "#5C2B20",
          "dark-active-border": "#E07A5F",
          "dark-text": "#E0E0E0",
          "dark-text-muted": "#CCCCCC",
        },
      },
    },
  },
  plugins: [],
};
export default config;
