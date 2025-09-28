import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./app/tests/setup.js"],
    testTimeout: 10000,
    json: {
      stringify: {
        maxSize: 999999999,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
    },
  },
});
