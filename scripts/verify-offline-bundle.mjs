import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "offline-dist", "build-manifest.json"), "utf8"));

for (const [name, expected] of Object.entries(manifest.files)) {
  const actual = createHash("sha256").update(readFileSync(resolve(root, "offline-dist", name))).digest("hex");
  if (actual !== expected) throw new Error(`Контрольная сумма ${name} не совпала.`);
}

if (manifest.formulaCount !== 24) throw new Error("В сборке должно быть 24 контрольные формулы.");
console.log(`Offline bundle verified: ${manifest.formulaCount}/24 formulas, engine ${manifest.formulaEngineVersion}`);
