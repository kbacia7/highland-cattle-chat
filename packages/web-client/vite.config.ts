import fs from "fs";

import { defineConfig, splitVendorChunkPlugin, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tsconfigPaths(), splitVendorChunkPlugin()],
    build: {
      target: "esnext",
    },
    worker: {
      format: "es",
    },
    server: {
      https: {
        key: fs.readFileSync(env.HTTPS_KEY_PATH),
        cert: fs.readFileSync(env.HTTPS_CERT_PATH),
      },
    },
  };
});
