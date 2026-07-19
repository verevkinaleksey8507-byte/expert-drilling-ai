import type { RiskLevel } from "./calculations";

export type CementInterval = {
  id: string;
  active: boolean;
  name: string;
  top: number;
  bottom: number;
  holeDiameter: number;
  casingOD: number;
  cavernosity: number;
  excess: number;
};

export type CementProgramSettings = {
  yieldM3PerTonne: number;
  waterM3PerTonne: number;
  bufferVolume: number;
  displacementVolume: number;
  pumpRate: number;
};

export type CementIntervalResult = CementInterval & {
  valid: boolean;
  error?: string;
  netVolume: number;
  designVolume: number;
};

export type CementProgramResult = {
  intervals: CementIntervalResult[];
  cementVolume: number;
  dryCementTonnes: number;
  mixingWater: number;
  totalPumped: number;
  pumpTime: number;
  level: RiskLevel;
  message: string;
};

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `interval-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const defaultCementIntervals = (): CementInterval[] => [
  { id: "cement-interval-1", active: true, name: "Открытый ствол", top: 2500, bottom: 3200, holeDiameter: 215.9, casingOD: 168.3, cavernosity: 1.18, excess: 10 },
  { id: "cement-interval-2", active: true, name: "За предыдущей колонной", top: 2100, bottom: 2500, holeDiameter: 220.5, casingOD: 168.3, cavernosity: 1, excess: 5 },
  { id: "cement-interval-3", active: false, name: "Дополнительный участок 3", top: 0, bottom: 0, holeDiameter: 0, casingOD: 0, cavernosity: 1, excess: 0 },
  { id: "cement-interval-4", active: false, name: "Дополнительный участок 4", top: 0, bottom: 0, holeDiameter: 0, casingOD: 0, cavernosity: 1, excess: 0 },
];

export const newCementInterval = (index: number): CementInterval => ({
  id: makeId(), active: false, name: `Дополнительный участок ${index}`, top: 0, bottom: 0,
  holeDiameter: 0, casingOD: 0, cavernosity: 1, excess: 0,
});

export function calculateCementProgram(
  intervals: CementInterval[],
  settings: CementProgramSettings,
): CementProgramResult {
  const calculated = intervals.map<CementIntervalResult>((interval) => {
    if (!interval.active) return { ...interval, valid: true, netVolume: 0, designVolume: 0 };
    let error = "";
    if (interval.bottom <= interval.top) error = "Нижняя глубина должна быть больше верхней.";
    else if (interval.holeDiameter <= 0 || interval.casingOD <= 0) error = "Укажите оба диаметра.";
    else if (interval.casingOD >= interval.holeDiameter) error = "Диаметр колонны должен быть меньше диаметра канала.";
    else if (interval.cavernosity < 1) error = "Коэффициент кавернозности не может быть меньше 1,00.";
    const area = Math.PI / 4 * ((interval.holeDiameter / 1000) ** 2 - (interval.casingOD / 1000) ** 2);
    const netVolume = error ? 0 : area * (interval.bottom - interval.top);
    const designVolume = netVolume * interval.cavernosity * (1 + interval.excess / 100);
    return { ...interval, valid: !error, error: error || undefined, netVolume, designVolume };
  });
  const active = calculated.filter((item) => item.active);
  const cementVolume = active.reduce((sum, item) => sum + item.designVolume, 0);
  const hasError = active.some((item) => !item.valid);
  const dryCementTonnes = settings.yieldM3PerTonne > 0 ? cementVolume / settings.yieldM3PerTonne : 0;
  const mixingWater = dryCementTonnes * settings.waterM3PerTonne;
  const totalPumped = settings.bufferVolume + cementVolume + settings.displacementVolume;
  const pumpTime = settings.pumpRate > 0 ? totalPumped / settings.pumpRate : 0;
  return {
    intervals: calculated, cementVolume, dryCementTonnes, mixingWater, totalPumped, pumpTime,
    level: hasError ? "critical" : active.length === 0 ? "warning" : "normal",
    message: hasError
      ? "Исправьте отмеченные активные участки. Корректные участки продолжают рассчитываться."
      : active.length === 0
        ? "Включите хотя бы один участок цементирования."
        : `В расчёт включено участков: ${active.length}. Неактивные строки не влияют на сумму.`,
  };
}
