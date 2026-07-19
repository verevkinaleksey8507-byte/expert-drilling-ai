import { copyFileSync, createWriteStream, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import archiver from "archiver";
import { build as buildWithEsbuild } from "esbuild";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "offline-dist");
const downloads = resolve(root, "public", "downloads");
const offlineZip = resolve(downloads, "Expert-Drilling-AI-Offline.zip");
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
mkdirSync(downloads, { recursive: true });
copyFileSync(resolve(root, "offline", "index.html"), resolve(output, "index.html"));
copyFileSync(resolve(root, "offline", "style.css"), resolve(output, "style.css"));
writeFileSync(resolve(output, "ОТКРОЙТЕ_МЕНЯ.txt"), "ЭКСПЕРТ БУРЕНИЕ AI — АВТОНОМНАЯ ВЕРСИЯ\n\n1. Распакуйте архив полностью.\n2. Откройте файл index.html двойным щелчком.\n3. Для работы интернет не нужен.\n4. Проекты сохраняются в браузере и переносятся файлом .drillcalc.\n\nПеред производственным применением сверяйте исходные данные и результаты с проектом, программой работ и требованиями ПБОТОС.\n", "utf8");
await buildWithEsbuild({
  entryPoints: [resolve(root, "offline", "app.ts")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  outfile: resolve(output, "app.js"),
  logLevel: "info",
});
const engineSource = readFileSync(resolve(root, "lib", "project.ts"), "utf8");
const engineVersion = engineSource.match(/FORMULA_ENGINE_VERSION\s*=\s*"([^"]+)"/)?.[1];
if (!engineVersion) throw new Error("Не найдена версия расчётного ядра.");
const formulaSource = readFileSync(resolve(root, "lib", "calculations.ts"), "utf8");
const formulaBlock = formulaSource.match(/export const formulaIndex\s*=\s*\[([\s\S]*?)\];/)?.[1] || "";
const formulaCount = (formulaBlock.match(/"[^"]+"/g) || []).length;
const files = Object.fromEntries(["index.html", "app.js", "style.css"].map((name) => [name, createHash("sha256").update(readFileSync(resolve(output, name))).digest("hex")]));
writeFileSync(resolve(output, "build-manifest.json"), JSON.stringify({ product: "Эксперт бурение AI", version: "0.2.0", formulaEngineVersion: engineVersion, formulaCount, createdAt: new Date().toISOString(), files }, null, 2));
rmSync(offlineZip, { force: true });
await new Promise((resolveArchive, rejectArchive) => {
  const stream = createWriteStream(offlineZip);
  const archive = archiver("zip", { zlib: { level: 9 } });
  stream.on("close", resolveArchive);
  stream.on("error", rejectArchive);
  archive.on("warning", (error) => error.code === "ENOENT" ? console.warn(error.message) : rejectArchive(error));
  archive.on("error", rejectArchive);
  archive.pipe(stream);
  archive.directory(output, false);
  archive.finalize();
});
console.log(offlineZip);
