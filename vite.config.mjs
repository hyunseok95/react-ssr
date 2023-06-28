import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import viteReact from '@vitejs/plugin-react'

// const path = fileURLToPath(new URL(import.meta.url))
// const root = resolve(dirname(path), 'client')
// const plugins = [
//   viteReact({ jsxRuntime: 'classic' })
// ]
export default defineConfig({
  root: "./src/client",
  build: {
    sourcemap: true,
    cssCodeSplit: false,
    outDir: "../../dist/client",
  },
  plugins: [react({ jsxRuntime: 'classic' }), vanillaExtractPlugin()],
  define: {
    "process.env": {},
  },
});

// export default {
//   root,
//   plugins,
// }
