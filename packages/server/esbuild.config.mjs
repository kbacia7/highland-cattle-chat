import * as esbuild from "esbuild";
import { replaceTscAliasPaths } from "tsc-alias";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  platform: "node",
  packages: "external",
  format: "esm",
  target: "es2022",
});

await replaceTscAliasPaths({
  configFile: "tsconfig.json",
  watch: false,
  outDir: "dist",
  declarationDir: "dist",
});
