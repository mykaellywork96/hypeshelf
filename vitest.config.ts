import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Pure Node environment — no DOM required for the unit tests here.
    environment: "node",
    // Expose describe / it / expect globally (matches Jest's API).
    globals: true,
  },
  resolve: {
    // Mirror the @/* alias from tsconfig.json so imports like
    // "@/lib/validateLink" resolve correctly inside tests.
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
