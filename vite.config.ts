import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

try {
  const src = "C:/Users/aksha/.gemini/antigravity-ide/brain/5837e2d2-9262-41b9-a1df-e3c6d17c76cb/media__1785303552689.jpg";
  const destDir = path.resolve("public/images");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const dest = path.join(destDir, "owner.png");
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("SKD INFO: Automatically copied owner.png to public/images/owner.png");
  }
} catch (e) {
  console.error("SKD ERROR: Failed to copy owner.png:", e);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/admin': {
        target: 'http://localhost:5174',
        changeOrigin: true
      }
    }
  }
})

