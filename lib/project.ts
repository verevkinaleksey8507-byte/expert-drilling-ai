import type { CalculationResult } from "./calculations";
import type { WellProfile } from "./well";

export const PROJECT_FORMAT = "expert-drilling-ai-project" as const;
export const PROJECT_SCHEMA_VERSION = 1;
export const FORMULA_ENGINE_VERSION = "2026.07.1";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type CalculationRecord = {
  id: string;
  revision: number;
  moduleId: string;
  title: string;
  formulaVersion: string;
  createdAt: string;
  inputs: Record<string, number>;
  result: CalculationResult;
  wellId: string;
  comment?: string;
};

export type DrillCalcProject = {
  format: typeof PROJECT_FORMAT;
  schemaVersion: number;
  formulaEngineVersion: string;
  projectId: string;
  exportedAt: string;
  activeWellId: string;
  wells: WellProfile[];
  history: CalculationRecord[];
  favorites: string[];
  integrity: string;
};

const canonicalPayload = (project: Omit<DrillCalcProject, "integrity">) =>
  JSON.stringify(project);

const checksum = (source: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
};

export function createProjectFile(data: {
  projectId?: string;
  activeWellId: string;
  wells: WellProfile[];
  history: CalculationRecord[];
  favorites: string[];
}): DrillCalcProject {
  const payload: Omit<DrillCalcProject, "integrity"> = {
    format: PROJECT_FORMAT,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    formulaEngineVersion: FORMULA_ENGINE_VERSION,
    projectId: data.projectId || makeId(),
    exportedAt: new Date().toISOString(),
    activeWellId: data.activeWellId,
    wells: data.wells,
    history: data.history,
    favorites: data.favorites,
  };
  return { ...payload, integrity: checksum(canonicalPayload(payload)) };
}

export function validateProjectFile(input: unknown): DrillCalcProject {
  if (!input || typeof input !== "object") throw new Error("Файл проекта пуст или повреждён.");
  const project = input as DrillCalcProject;
  if (project.format !== PROJECT_FORMAT) throw new Error("Это не файл проекта «Эксперт бурение AI».");
  if (project.schemaVersion > PROJECT_SCHEMA_VERSION) throw new Error("Файл создан более новой версией приложения.");
  if (!Array.isArray(project.wells) || project.wells.length === 0) throw new Error("В проекте отсутствует карточка скважины.");
  if (!Array.isArray(project.history) || !Array.isArray(project.favorites)) throw new Error("Структура проекта повреждена.");
  if (!project.wells.some((well) => well.id === project.activeWellId)) throw new Error("Активная скважина проекта не найдена.");
  const { integrity, ...payload } = project;
  if (integrity !== checksum(canonicalPayload(payload))) throw new Error("Контрольная сумма не совпала. Файл мог быть изменён или повреждён.");
  return project;
}

export function downloadProject(project: DrillCalcProject, name: string) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/x-drillcalc+json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.replace(/[^a-zA-Zа-яА-Я0-9_-]+/g, "-") || "drilling-project"}.drillcalc`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readProject(file: File) {
  if (file.size > 25 * 1024 * 1024) throw new Error("Файл проекта больше 25 МБ. Проверьте, что выбран правильный файл.");
  return validateProjectFile(JSON.parse(await file.text()));
}
