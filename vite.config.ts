import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages では https://akirafuruta01.github.io/drone-exam/ で公開されるため
  base: "/drone-exam/",
  plugins: [react(), tailwindcss()],
});
