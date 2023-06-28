import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import viteReact from "@vitejs/plugin-react";

const path = fileURLToPath(new URL(import.meta.url));
const root = resolve(dirname(path), "src", "client");
// const root = dirname(path);
const build = {
  outDir: resolve(dirname(path), "dist"),
};
const plugins = [viteReact({ jsxRuntime: "classic" })];

export default {
  root,
  build,
  plugins,
};
