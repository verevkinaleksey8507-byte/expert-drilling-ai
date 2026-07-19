import { fmt, modules, formulaIndex, type CalculationResult } from "../lib/calculations";
import { calculateCementProgram, defaultCementIntervals, type CementInterval, type CementProgramSettings } from "../lib/cement-program";
import { createDefaultWell, type WellProfile } from "../lib/well";
import { createProjectFile, downloadProject, FORMULA_ENGINE_VERSION, readProject, type CalculationRecord } from "../lib/project";

type OfflineState = {
  moduleId: string;
  values: Record<string, Record<string, number>>;
  well: WellProfile;
  history: CalculationRecord[];
  favorites: string[];
  cementIntervals: CementInterval[];
  cementSettings: CementProgramSettings;
};

const STORAGE_KEY = "expert-drilling-ai-offline-v1";
const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] || char));

const defaultState = (): OfflineState => ({
  moduleId: "cement",
  values: Object.fromEntries(modules.map((item) => [item.id, { ...item.defaults }])),
  well: createDefaultWell("offline-demo-well"),
  history: [],
  favorites: [],
  cementIntervals: defaultCementIntervals(),
  cementSettings: { yieldM3PerTonne: 0.79, waterM3PerTonne: 0.44, bufferVolume: 4, displacementVolume: 47, pumpRate: 1.2 },
});

function loadState(): OfflineState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<OfflineState> | null;
    return saved ? { ...defaultState(), ...saved } : defaultState();
  } catch { return defaultState(); }
}

const state = loadState();
let search = "";
let showHistory = false;
let showWell = false;

const activeModule = () => modules.find((item) => item.id === state.moduleId) || modules[0];
const activeValues = () => state.values[state.moduleId] || { ...activeModule().defaults };
const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

function calculation(): { result: CalculationResult | null; errors: Record<string, string> } {
  const calculationModule = activeModule();
  if (calculationModule.id === "cement") {
    const program = calculateCementProgram(state.cementIntervals, state.cementSettings);
    const errors: Record<string, string> = program.level === "critical" ? { cement: program.message } : {};
    return {
      errors,
      result: Object.keys(errors).length ? null : {
        value: program.cementVolume,
        unit: "м³",
        secondary: `Всего закачать ${fmt(program.totalPumped)} м³ · ${fmt(program.dryCementTonnes)} т сухого цемента`,
        level: program.level,
        conclusion: program.message,
        recommendation: "Сверьте кавернозность и технологические объёмы с утверждённой программой цементирования.",
        steps: program.intervals.filter((item) => item.active).map((item) => `${item.name}: ${fmt(item.designVolume)} м³`),
        metrics: [
          { label: "Сухой цемент", value: `${fmt(program.dryCementTonnes)} т` },
          { label: "Вода затворения", value: `${fmt(program.mixingWater)} м³` },
          { label: "Время закачки", value: `${fmt(program.pumpTime, 1)} мин` },
        ],
      },
    };
  }
  const errors = calculationModule.validate(activeValues());
  return { errors, result: Object.keys(errors).length ? null : calculationModule.calculate(activeValues()) };
}

const fieldHtml = (field: ReturnType<typeof activeModule>["fields"][number]) => {
  const value = activeValues()[field.key];
  return `<label class="field ${calculation().errors[field.key] ? "error" : ""}"><span>${escapeHtml(field.label)} <button class="help" title="${escapeHtml(field.description)}\n${escapeHtml(field.example)}">?</button></span><div><input data-field="${field.key}" type="number" value="${Number.isFinite(value) ? value : ""}" min="${field.min}" max="${field.max}" step="${field.step || "any"}" /><em>${escapeHtml(field.units[0].label)}</em></div><small>${escapeHtml(calculation().errors[field.key] || field.example)}</small></label>`;
};

const cementHtml = () => `<section class="cement-grid"><div class="section-title"><span>4 независимых участка</span><strong>Баланс цементирования</strong></div><div class="cement-head"><span>Вкл.</span><span>Участок</span><span>Верх, м</span><span>Низ, м</span><span>Ствол, мм</span><span>Колонна, мм</span><span>Кав.</span><span>Запас, %</span></div>${state.cementIntervals.map((item, index) => `<div class="cement-row"><input data-cement="active" data-index="${index}" type="checkbox" ${item.active ? "checked" : ""}/><input data-cement="name" data-index="${index}" value="${escapeHtml(item.name)}"/><input data-cement="top" data-index="${index}" type="number" value="${item.top}"/><input data-cement="bottom" data-index="${index}" type="number" value="${item.bottom}"/><input data-cement="holeDiameter" data-index="${index}" type="number" value="${item.holeDiameter}"/><input data-cement="casingOD" data-index="${index}" type="number" value="${item.casingOD}"/><input data-cement="cavernosity" data-index="${index}" type="number" step="0.01" value="${item.cavernosity}"/><input data-cement="excess" data-index="${index}" type="number" value="${item.excess}"/></div>`).join("")}<div class="cement-settings"><label>Буфер, м³<input data-setting="bufferVolume" type="number" value="${state.cementSettings.bufferVolume}"/></label><label>Продавка, м³<input data-setting="displacementVolume" type="number" value="${state.cementSettings.displacementVolume}"/></label><label>Выход, м³/т<input data-setting="yieldM3PerTonne" type="number" step="0.01" value="${state.cementSettings.yieldM3PerTonne}"/></label><label>Вода, м³/т<input data-setting="waterM3PerTonne" type="number" step="0.01" value="${state.cementSettings.waterM3PerTonne}"/></label><label>Расход, м³/мин<input data-setting="pumpRate" type="number" step="0.1" value="${state.cementSettings.pumpRate}"/></label></div></section>`;

function render() {
  const calculationModule = activeModule();
  const { result } = calculation();
  const filtered = modules.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <header><div class="brand"><b>EX</b><span><strong>Эксперт бурение AI</strong><small>АВТОНОМНАЯ ВЕРСИЯ · ЯДРО ${FORMULA_ENGINE_VERSION}</small></span></div><div class="offline"><i></i>Без сервера · данные на устройстве</div><div class="header-actions"><button data-action="well">Скважина</button><button data-action="export">Скачать проект</button><label class="import">Открыть проект<input id="project-file" type="file" accept=".drillcalc"/></label><button data-action="history">История ${state.history.length ? `<b>${state.history.length}</b>` : ""}</button></div></header>
    <aside><div class="search"><input id="search" placeholder="Найти расчёт..." value="${escapeHtml(search)}" /></div><nav>${filtered.map((item) => `<button data-module="${item.id}" class="${item.id === calculationModule.id ? "active" : ""}"><i>${escapeHtml(item.icon.slice(0, 1).toUpperCase())}</i><span><strong>${escapeHtml(item.shortTitle)}</strong><small>${escapeHtml(item.category)}</small></span></button>`).join("")}</nav><footer><span>Контроль переноса</span><strong>24 / ${formulaIndex.length}</strong><small>формулы доступны автономно</small></footer></aside>
    <main>
      <div class="page-title"><div><span>${escapeHtml(calculationModule.category)}</span><h1>${escapeHtml(calculationModule.title)}</h1><p>${escapeHtml(calculationModule.description)}</p></div><button data-action="print">Печать / PDF</button></div>
      <div class="layout"><section class="calculator"><div class="card-title"><b>1</b><span><strong>Исходные данные</strong><small>Результат пересчитывается автоматически</small></span></div>${calculationModule.id === "cement" ? cementHtml() : `<div class="fields">${calculationModule.fields.map(fieldHtml).join("")}</div>`}<div class="formula"><span>Формула</span><strong>${escapeHtml(calculationModule.formula)}</strong></div><div class="explanation"><div><span>Физический смысл</span><p>${escapeHtml(calculationModule.physicalMeaning)}</p></div><div><span>Где применять</span><p>${escapeHtml(calculationModule.applicability)}</p></div><div><span>Ограничения</span><p>${escapeHtml(calculationModule.limitations)}</p></div></div></section>
      <section class="result-card"><div class="card-title"><b>2</b><span><strong>Результат</strong><small>Сохраните расчёт в журнал</small></span></div>${result ? `<div class="result ${result.level}"><span>Расчётное значение</span><strong>${fmt(result.value)} <small>${escapeHtml(result.unit)}</small></strong><p>${escapeHtml(result.secondary || "")}</p></div>${result.metrics ? `<div class="metrics">${result.metrics.map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("")}</div>` : ""}<div class="conclusion ${result.level}"><strong>${escapeHtml(result.conclusion)}</strong><p>${escapeHtml(result.recommendation)}</p></div><div class="steps"><span>Ход расчёта</span>${result.steps.map((step, index) => `<p><b>${index + 1}</b>${escapeHtml(step)}</p>`).join("")}</div><button class="save" data-action="save">Сохранить расчёт</button>` : `<div class="empty"><strong>Проверьте исходные данные</strong><p>После исправления результат появится автоматически.</p></div>`}</section></div>
      <p class="safety">Инструмент предназначен для независимой инженерной проверки. Рабочие решения принимайте по утверждённой программе и корпоративным процедурам ПБОТОС.</p>
    </main>
    ${showHistory ? `<div class="modal"><button class="backdrop" data-action="close"></button><section><div class="modal-head"><div><span>Локальный журнал</span><h2>История расчётов</h2></div><button data-action="close">×</button></div><div class="history">${state.history.length ? state.history.map((item) => `<button data-history="${item.id}"><span><strong>${escapeHtml(item.title)}</strong><small>${new Date(item.createdAt).toLocaleString("ru-RU")} · ревизия ${item.revision}</small></span><b>${fmt(item.result.value)} ${escapeHtml(item.result.unit)}</b></button>`).join("") : `<p>Сохранённых расчётов пока нет.</p>`}</div></section></div>` : ""}
    ${showWell ? `<div class="modal"><button class="backdrop" data-action="close"></button><section><div class="modal-head"><div><span>Карточка скважины</span><h2>Исходные данные</h2></div><button data-action="close">×</button></div><div class="well-fields"><label>Месторождение<input data-well="field" value="${escapeHtml(state.well.field)}"/></label><label>Куст<input data-well="pad" value="${escapeHtml(state.well.pad)}"/></label><label>Скважина №<input data-well="wellNumber" value="${escapeHtml(state.well.wellNumber)}"/></label><label>MD, м<input data-well="md" type="number" value="${state.well.md}"/></label><label>TVD, м<input data-well="tvd" type="number" value="${state.well.tvd}"/></label><label>Текущий забой, м<input data-well="currentBottom" type="number" value="${state.well.currentBottom}"/></label><label>Плотность раствора, кг/м³<input data-well="mudDensity" type="number" value="${state.well.mudDensity}"/></label><label>Инженер<input data-well="engineer" value="${escapeHtml(state.well.engineer)}"/></label></div><button class="modal-save" data-action="close">Сохранить локально</button></section></div>` : ""}`;
}

function saveCalculation() {
  const { result } = calculation();
  if (!result) return;
  const calculationModule = activeModule();
  state.history.unshift({ id: makeId(), revision: state.history.filter((item) => item.moduleId === calculationModule.id).length + 1, moduleId: calculationModule.id, title: calculationModule.title, formulaVersion: FORMULA_ENGINE_VERSION, createdAt: new Date().toISOString(), inputs: { ...activeValues() }, result, wellId: state.well.id });
  state.history = state.history.slice(0, 100);
  saveState(); render();
}

document.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  if (target.id === "search") { search = target.value; render(); document.querySelector<HTMLInputElement>("#search")?.focus(); return; }
  if (target.dataset.field) state.values[state.moduleId][target.dataset.field] = Number(target.value);
  if (target.dataset.setting) (state.cementSettings as unknown as Record<string, number>)[target.dataset.setting] = Number(target.value);
  if (target.dataset.cement) {
    const item = state.cementIntervals[Number(target.dataset.index)];
    const key = target.dataset.cement as keyof CementInterval;
    (item as unknown as Record<string, string | number | boolean>)[key] = target.type === "checkbox" ? target.checked : target.type === "number" ? Number(target.value) : target.value;
  }
  if (target.dataset.well) (state.well as unknown as Record<string, string | number>)[target.dataset.well] = target.type === "number" ? Number(target.value) : target.value;
  saveState();
});

document.addEventListener("change", async (event) => {
  const target = event.target as HTMLInputElement;
  if (target.id === "project-file" && target.files?.[0]) {
    try {
      const project = await readProject(target.files[0]);
      state.well = project.wells.find((well) => well.id === project.activeWellId) || project.wells[0];
      state.history = project.history;
      state.favorites = project.favorites;
      saveState(); render();
    } catch (error) { alert(error instanceof Error ? error.message : "Не удалось открыть проект"); }
  }
  if (target.dataset.field || target.dataset.setting || target.dataset.cement) render();
});

document.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-module],[data-action],[data-history]");
  if (!target) return;
  if (target.dataset.module) { state.moduleId = target.dataset.module; saveState(); render(); }
  if (target.dataset.action === "save") saveCalculation();
  if (target.dataset.action === "print") window.print();
  if (target.dataset.action === "history") { showHistory = true; render(); }
  if (target.dataset.action === "well") { showWell = true; render(); }
  if (target.dataset.action === "close") { showHistory = false; showWell = false; saveState(); render(); }
  if (target.dataset.action === "export") downloadProject(createProjectFile({ activeWellId: state.well.id, wells: [state.well], history: state.history, favorites: state.favorites }), `${state.well.field}-${state.well.wellNumber}`);
  if (target.dataset.history) {
    const item = state.history.find((record) => record.id === target.dataset.history);
    if (item) { state.moduleId = item.moduleId; state.values[item.moduleId] = { ...item.inputs }; showHistory = false; render(); }
  }
});

render();
