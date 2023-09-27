import fs from "fs";
import path from "path";

import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), splitVendorChunkPlugin()],
  build: {
    target: "esnext",
  },
  worker: {
    format: "es",
  },
  server: {
    https: {
      key: fs.readFileSync(path.join("./https", "localhost-key.pem")),
      cert: fs.readFileSync(path.join("./https", "localhost.pem")),
    },
  },
});
