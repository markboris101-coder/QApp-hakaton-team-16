import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  // Явно задаём PostCSS здесь — иначе на Windows иногда не подхватывается postcss.config.js,
  // в браузер попадают сырые @tailwind-директивы и страница без стилей.
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
});
