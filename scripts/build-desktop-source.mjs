import { mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const downloads = resolve(root, "public", "downloads");
const output = resolve(downloads, "Expert-Drilling-AI-Desktop-Source.zip");
mkdirSync(downloads, { recursive: true });
rmSync(output, { force: true });

const paths = [
  ".github/workflows/desktop-release.yml",
  "desktop",
  "offline",
  "lib",
  "scripts/build-offline.mjs",
  "scripts/build-desktop-source.mjs",
  "scripts/verify-offline-bundle.mjs",
  "scripts/sites-env.sh",
  "tests/calculations.test.ts",
  "eslint.config.mjs",
  "tsconfig.json",
  "package.json",
  "package-lock.json"
];

const zip = spawnSync("zip", ["-q", "-r", output, ...paths, "-x", "desktop/node_modules/*", "desktop/src-tauri/target/*"], { cwd: root, stdio: "inherit" });
if (zip.status !== 0) process.exit(zip.status || 1);
console.log(output);
