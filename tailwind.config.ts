import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { sage: { 50: "#F8F7F3", 100: "#DFF3E8", 200: "#b8e1cf", 500: "#267C60", 700: "#1c5d48" }, lilac: "#EAE4FA", ink: "#25342D", cream: "#F8F7F3" }, boxShadow: { soft: "0 18px 45px rgba(38,124,96,.12)" }, fontFamily: { sans: ["Nunito", "Arial", "Helvetica", "sans-serif"] } } },
  plugins: []
};
export default config;
