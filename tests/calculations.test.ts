import assert from "node:assert/strict";
import test from "node:test";
import { formulaIndex, modules } from "../lib/calculations.ts";
import { calculateCementProgram, defaultCementIntervals } from "../lib/cement-program.ts";

test("единое ядро содержит все 24 контрольные формулы", () => {
  assert.equal(formulaIndex.length, 24);
  assert.equal(new Set(formulaIndex).size, 24);
});

test("все модули принимают контрольные исходные данные", () => {
  assert.equal(modules.length, 20);
  for (const calculationModule of modules) {
    assert.deepEqual(calculationModule.validate(calculationModule.defaults), {}, `${calculationModule.id}: ошибки в контрольных данных`);
    const result = calculationModule.calculate(calculationModule.defaults);
    assert.ok(Number.isFinite(result.value), `${calculationModule.id}: результат не является числом`);
    assert.ok(result.unit.length > 0, `${calculationModule.id}: отсутствует единица`);
    assert.ok(result.steps.length > 0, `${calculationModule.id}: отсутствует ход расчёта`);
  }
});

test("гидростатическое давление совпадает с ручным контрольным расчётом", () => {
  const calculationModule = modules.find((item) => item.id === "hydrostatic");
  assert.ok(calculationModule);
  const result = calculationModule.calculate({ density: 1250, tvd: 3000 });
  assert.ok(Math.abs(result.value - 36.7749375) < 1e-9);
});

test("цементный объём совпадает с контрольным примером Excel", () => {
  const interval = defaultCementIntervals()[0];
  const result = calculateCementProgram([interval], { yieldM3PerTonne: 0.79, waterM3PerTonne: 0.44, bufferVolume: 4, displacementVolume: 47, pumpRate: 1.2 });
  assert.ok(Math.abs(result.cementVolume - 13.050493271834611) < 1e-9);
});

test("конвертация единиц сохраняет размерность", () => {
  const hydro = modules.find((item) => item.id === "hydrostatic");
  assert.ok(hydro);
  const density = hydro.fields.find((field) => field.key === "density");
  const pressure = modules.find((item) => item.id === "density-pressure")?.fields.find((field) => field.key === "pressure");
  assert.equal(density?.units.find((unit) => unit.label === "ppg")?.factor, 119.826427);
  assert.equal(pressure?.units.find((unit) => unit.label === "psi")?.factor, 0.006894757);
});
