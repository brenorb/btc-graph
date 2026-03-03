import { defineConfig } from "vite";

const base = process.env.BASE_PATH ?? "/btc-graph/";

export default defineConfig({
  base,
  server: {
    port: 5173,
    host: true,
  },
});
