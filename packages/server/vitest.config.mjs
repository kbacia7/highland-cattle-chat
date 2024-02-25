import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    sequence: {
      setupFiles: "list",
    },
    isolate: false,
    fileParallelism: false,
    setupFiles: ["./test/setup/setup.ts"],
    typecheck: {
      tsconfig: "./tsconfig.json",
    },
  },
});
