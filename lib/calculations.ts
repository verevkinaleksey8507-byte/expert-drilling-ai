export type RiskLevel = "normal" | "warning" | "critical";
export type VisualKind =
  | "cement"
  | "pressure"
  | "volume"
  | "flow"
  | "well-control"
  | "ecd"
  | "string"
  | "rop"
  | "power";

export type UnitOption = {
  label: string;
  factor: number;
  decimals?: number;
};

export type FieldDefinition = {
  key: string;
  label: string;
  description: string;
  example: string;
  units: UnitOption[];
  min: number;
  max: number;
  step?: number;
};

export type CalculationResult = {
  value: number;
  unit: string;
  secondary?: string;
  level: RiskLevel;
  conclusion: string;
  recommendation: string;
  steps: string[];
  metrics?: Array<{ label: string; value: string }>;
};

export type CalculationModule = {
  id: string;
  category: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  visual: VisualKind;
  formula: string;
  physicalMeaning: string;
  applicability: string;
  limitations: string;
  fields: FieldDefinition[];
  defaults: Record<string, number>;
  validate: (values: Record<string, number>) => Record<string, string>;
  calculate: (values: Record<string, number>) => CalculationResult;
};

const g = 9.80665;
const lengthUnits: UnitOption[] = [
  { label: "м", factor: 1, decimals: 0 },
  { label: "ft", factor: 0.3048, decimals: 0 },
];
const diameterUnits: UnitOption[] = [
  { label: "мм", factor: 1, decimals: 1 },
  { label: "in", factor: 25.4, decimals: 3 },
];
const densityUnits: UnitOption[] = [
  { label: "кг/м³", factor: 1, decimals: 0 },
  { label: "ppg", factor: 119.826427, decimals: 2 },
];
const pressureUnits: UnitOption[] = [
  { label: "МПа", factor: 1, decimals: 2 },
  { label: "bar", factor: 0.1, decimals: 1 },
  { label: "psi", factor: 0.006894757, decimals: 0 },
];
const flowUnits: UnitOption[] = [
  { label: "м³/мин", factor: 1, decimals: 3 },
  { label: "л/с", factor: 0.06, decimals: 1 },
  { label: "gpm", factor: 0.003785412, decimals: 0 },
];

const field = (
  key: string,
  label: string,
  description: string,
  example: string,
  units: UnitOption[],
  min: number,
  max: number,
  step?: number,
): FieldDefinition => ({ key, label, description, example, units, min, max, step });

const baseValidation = (
  fields: FieldDefinition[],
  values: Record<string, number>,
) => {
  const errors: Record<string, string> = {};
  fields.forEach((item) => {
    const value = values[item.key];
    if (!Number.isFinite(value)) errors[item.key] = "Введите числовое значение.";
    else if (value < item.min)
      errors[item.key] = `Значение не может быть меньше ${item.min}.`;
    else if (value > item.max)
      errors[item.key] = `Значение не может быть больше ${item.max}.`;
  });
  return errors;
};

const fmt = (value: number, digits = 2) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);

const annulusArea = (holeMm: number, pipeMm: number) =>
  (Math.PI / 4) * ((holeMm / 1000) ** 2 - (pipeMm / 1000) ** 2);

const cementFields = [
  field("totalDepth", "Глубина скважины", "Фактическая глубина по стволу (MD). Возьмите из суточного рапорта.", "Например: 3500 м", lengthUnits, 100, 15000),
  field("shoeDepth", "Башмак колонны", "Глубина нижнего конца цементируемой обсадной колонны.", "Например: 3200 м", lengthUnits, 50, 15000),
  field("cementTop", "Верх цемента", "Плановая глубина верхней границы цементного кольца.", "Например: 2500 м", lengthUnits, 0, 15000),
  field("holeDiameter", "Диаметр ствола", "Номинальный или фактический диаметр ствола. Для точности используйте кавернометрию.", "Например: 215,9 мм", diameterUnits, 50, 1000),
  field("casingOD", "Наружный Ø колонны", "Наружный диаметр обсадной трубы по спецификации.", "Например: 168,3 мм", diameterUnits, 30, 900),
  field("excess", "Коэффициент запаса", "Дополнительный объём на кавернозность и неопределённость геометрии.", "Обычно: 10–30 %", [{ label: "%", factor: 1, decimals: 0 }], 0, 100),
  field("slurryDensity", "Плотность цемента", "Проектная плотность цементного раствора при закачке.", "Например: 1850 кг/м³", densityUnits, 1000, 2600),
  field("pumpRate", "Расход закачки", "Средний расход цементировочного агрегата.", "Например: 1,2 м³/мин", flowUnits, 0.01, 8),
];

export const modules: CalculationModule[] = [
  {
    id: "cement",
    category: "Цементирование",
    title: "Объём цементного раствора",
    shortTitle: "Цементирование",
    description: "Объём кольцевого пространства с запасом и оценкой времени закачки.",
    icon: "layers",
    visual: "cement",
    formula: "V = π/4 × (Dₛ² − Dₖ²) × (Hₛ − Hᵥ) × (1 + K/100)",
    physicalMeaning: "Показывает, сколько цементного раствора требуется для заполнения кольцевого пространства между стволом и колонной.",
    applicability: "Первичная оценка объёма перед цементированием обсадной колонны.",
    limitations: "Для рабочего плана замените номинальный диаметр ствола данными кавернометрии и учтите технологические объёмы по программе цементирования.",
    fields: cementFields,
    defaults: { totalDepth: 3500, shoeDepth: 3200, cementTop: 2500, holeDiameter: 215.9, casingOD: 168.3, excess: 20, slurryDensity: 1850, pumpRate: 1.2 },
    validate(values) {
      const errors = baseValidation(cementFields, values);
      if (values.shoeDepth > values.totalDepth)
        errors.shoeDepth = "Башмак колонны не может быть глубже скважины.";
      if (values.cementTop >= values.shoeDepth)
        errors.cementTop = "Верх цемента должен находиться выше башмака колонны.";
      if (values.casingOD >= values.holeDiameter)
        errors.casingOD = "Диаметр колонны должен быть меньше диаметра ствола.";
      return errors;
    },
    calculate(v) {
      const height = v.shoeDepth - v.cementTop;
      const area = annulusArea(v.holeDiameter, v.casingOD);
      const net = area * height;
      const total = net * (1 + v.excess / 100);
      const time = total / v.pumpRate;
      const hydro = (v.slurryDensity * g * height) / 1e6;
      const level: RiskLevel = v.excess < 10 ? "warning" : v.excess > 50 ? "warning" : "normal";
      return {
        value: total,
        unit: "м³",
        secondary: `Чистый объём ${fmt(net)} м³ · закачка ≈ ${fmt(time, 1)} мин`,
        level,
        conclusion: level === "normal" ? "Расчётный объём формирует заданную высоту подъёма цемента." : "Запас объёма требует инженерной проверки.",
        recommendation: v.excess < 10 ? "Проверьте кавернометрию: запас менее 10% может привести к недоподъёму." : "Сопоставьте результат с программой цементирования и фактической кавернометрией.",
        steps: [
          `Интервал цементирования: ${fmt(v.shoeDepth)} − ${fmt(v.cementTop)} = ${fmt(height)} м.`,
          `Площадь кольца: π/4 × (${fmt(v.holeDiameter / 1000, 4)}² − ${fmt(v.casingOD / 1000, 4)}²) = ${fmt(area, 4)} м².`,
          `Чистый объём: ${fmt(area, 4)} × ${fmt(height)} = ${fmt(net)} м³.`,
          `С запасом ${fmt(v.excess, 0)}%: ${fmt(net)} × ${fmt(1 + v.excess / 100, 2)} = ${fmt(total)} м³.`,
        ],
        metrics: [
          { label: "Высота подъёма", value: `${fmt(height, 0)} м` },
          { label: "Гидростатика цемента", value: `${fmt(hydro)} МПа` },
          { label: "Оценка времени", value: `${fmt(time, 1)} мин` },
        ],
      };
    },
  },
  {
    id: "hydrostatic",
    category: "Давления",
    title: "Гидростатическое давление",
    shortTitle: "Гидростатика",
    description: "Давление столба жидкости на заданной вертикальной глубине.",
    icon: "gauge",
    visual: "pressure",
    formula: "P = ρ × g × TVD / 1 000 000",
    physicalMeaning: "Чем выше плотность жидкости и вертикальная глубина, тем больше давление на забое.",
    applicability: "Быстрая проверка статического давления бурового, цементного или другой технологической жидкости.",
    limitations: "Используйте TVD, а не длину ствола MD. Формула не учитывает потери давления при циркуляции.",
    fields: [
      field("density", "Плотность жидкости", "Фактическая плотность по замеру или программе.", "Например: 1250 кг/м³", densityUnits, 500, 2600),
      field("tvd", "Вертикальная глубина TVD", "Истинная вертикальная глубина точки расчёта.", "Например: 3000 м", lengthUnits, 1, 15000),
    ],
    defaults: { density: 1250, tvd: 3000 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) {
      const value = (v.density * g * v.tvd) / 1e6;
      return { value, unit: "МПа", secondary: `${fmt(value * 10, 1)} bar · ${fmt(value / 0.006894757, 0)} psi`, level: "normal", conclusion: "Рассчитано статическое давление столба жидкости.", recommendation: "Сравните с пластовым давлением и давлением гидроразрыва по утверждённому окну бурения.", steps: [`Подставляем: ${fmt(v.density, 0)} × 9,80665 × ${fmt(v.tvd, 0)} / 1 000 000.`, `Получаем ${fmt(value)} МПа.`] };
    },
  },
  {
    id: "annulus",
    category: "Объёмы",
    title: "Объём кольцевого пространства",
    shortTitle: "Кольцевой объём",
    description: "Объём между стенкой ствола и наружной поверхностью трубы.",
    icon: "circle",
    visual: "volume",
    formula: "V = π/4 × (Dₛ² − Dₜ²) × L",
    physicalMeaning: "Показывает объём жидкости, находящейся снаружи трубы на выбранном интервале.",
    applicability: "Промывка, замещение, цементирование, пачки и гидравлические расчёты.",
    limitations: "Номинальный диаметр ствола даёт приближённый результат; каверны увеличивают фактический объём.",
    fields: [
      field("holeDiameter", "Диаметр ствола", "Фактический или номинальный диаметр открытого ствола.", "215,9 мм", diameterUnits, 50, 1000),
      field("pipeOD", "Наружный Ø трубы", "Наружный диаметр трубы или колонны.", "127 мм", diameterUnits, 20, 900),
      field("length", "Длина интервала", "Длина участка, для которого нужен объём.", "1000 м", lengthUnits, 0.1, 15000),
    ],
    defaults: { holeDiameter: 215.9, pipeOD: 127, length: 1000 },
    validate(v) { const e = baseValidation(this.fields, v); if (v.pipeOD >= v.holeDiameter) e.pipeOD = "Наружный диаметр трубы должен быть меньше диаметра ствола."; return e; },
    calculate(v) { const area = annulusArea(v.holeDiameter, v.pipeOD); const value = area * v.length; return { value, unit: "м³", secondary: `${fmt(value * 6.28981, 1)} bbl`, level: "normal", conclusion: "Рассчитан геометрический объём кольцевого пространства.", recommendation: "Для открытого ствола примените коэффициент кавернозности или данные кавернометрии.", steps: [`Площадь кольца = ${fmt(area, 4)} м².`, `Объём = ${fmt(area, 4)} × ${fmt(v.length, 0)} = ${fmt(value)} м³.`] }; },
  },
  {
    id: "hydraulics",
    category: "Гидравлика",
    title: "Скорость потока в затрубье",
    shortTitle: "Скорость потока",
    description: "Средняя скорость восходящего потока в кольцевом пространстве.",
    icon: "flow",
    visual: "flow",
    formula: "v = (Q / 60) / Aₖ",
    physicalMeaning: "Характеризует способность потока выносить шлам из скважины.",
    applicability: "Оперативная оценка очистки ствола и режимов промывки.",
    limitations: "Не учитывает эксцентриситет труб, реологию, размер шлама, угол наклона и вращение колонны.",
    fields: [
      field("flow", "Расход насоса", "Суммарный фактический расход всех работающих насосов.", "1,8 м³/мин", flowUnits, 0.01, 10),
      field("holeDiameter", "Диаметр ствола", "Диаметр текущего интервала ствола.", "215,9 мм", diameterUnits, 50, 1000),
      field("pipeOD", "Наружный Ø трубы", "Наружный диаметр бурильной колонны.", "127 мм", diameterUnits, 20, 900),
    ],
    defaults: { flow: 1.8, holeDiameter: 215.9, pipeOD: 127 },
    validate(v) { const e = baseValidation(this.fields, v); if (v.pipeOD >= v.holeDiameter) e.pipeOD = "Труба должна быть меньше ствола."; return e; },
    calculate(v) { const area = annulusArea(v.holeDiameter, v.pipeOD); const value = (v.flow / 60) / area; const level: RiskLevel = value < 0.3 ? "warning" : value > 2.5 ? "critical" : "normal"; return { value, unit: "м/с", secondary: `${fmt(value * 196.8504, 0)} ft/min`, level, conclusion: level === "normal" ? "Средняя скорость находится в рабочем диапазоне предварительной оценки." : value < 0.3 ? "Скорость может быть недостаточной для устойчивого выноса шлама." : "Высокая скорость может увеличить потери давления и риск размыва.", recommendation: "Подтвердите режим расчётом очистки ствола с учётом реологии, угла и размера шлама.", steps: [`Площадь кольца = ${fmt(area, 4)} м².`, `Расход в м³/с: ${fmt(v.flow, 3)} / 60 = ${fmt(v.flow / 60, 4)}.`, `Скорость = ${fmt(v.flow / 60, 4)} / ${fmt(area, 4)} = ${fmt(value)} м/с.`] }; },
  },
  {
    id: "kill-mud",
    category: "Контроль скважины",
    title: "Плотность раствора глушения",
    shortTitle: "Раствор глушения",
    description: "Оценка требуемой плотности по SIDPP и вертикальной глубине.",
    icon: "shield",
    visual: "well-control",
    formula: "ρₖ = ρₘ + SIDPP × 10⁶ / (g × TVD)",
    physicalMeaning: "Добавляет к текущей плотности эквивалент, необходимый для компенсации избыточного пластового давления.",
    applicability: "Независимая проверка kill sheet после стабилизации давлений.",
    limitations: "Используйте SIDPP, не SICP. Расчёт не заменяет утверждённую процедуру контроля скважины.",
    fields: [
      field("mudDensity", "Текущая плотность", "Плотность бурового раствора в скважине перед глушением.", "1200 кг/м³", densityUnits, 500, 2600),
      field("sidpp", "SIDPP", "Стабилизированное давление в бурильных трубах при закрытой скважине.", "3,5 МПа", pressureUnits, 0, 100),
      field("tvd", "TVD забоя", "Истинная вертикальная глубина забоя.", "3000 м", lengthUnits, 100, 15000),
    ],
    defaults: { mudDensity: 1200, sidpp: 3.5, tvd: 3000 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const increment = (v.sidpp * 1e6) / (g * v.tvd); const value = v.mudDensity + increment; const level: RiskLevel = value > 2200 ? "critical" : value - v.mudDensity > 300 ? "warning" : "normal"; return { value, unit: "кг/м³", secondary: `${fmt(value / 119.826427, 2)} ppg · прирост ${fmt(increment, 0)} кг/м³`, level, conclusion: "Получена теоретическая плотность раствора глушения по SIDPP.", recommendation: "Обязательно сверить с утверждённым kill sheet, максимальной допустимой плотностью и MAASP.", steps: [`Прирост плотности = ${fmt(v.sidpp)} × 1 000 000 / (9,80665 × ${fmt(v.tvd, 0)}) = ${fmt(increment, 0)} кг/м³.`, `Плотность глушения = ${fmt(v.mudDensity, 0)} + ${fmt(increment, 0)} = ${fmt(value, 0)} кг/м³.`] }; },
  },
  {
    id: "ecd",
    category: "Гидравлика",
    title: "Эквивалентная циркуляционная плотность",
    shortTitle: "ECD",
    description: "Плотность с учётом потерь давления в затрубье.",
    icon: "activity",
    visual: "ecd",
    formula: "ECD = ρₘ + ΔPₐ × 10⁶ / (g × TVD)",
    physicalMeaning: "Показывает, какую эффективную плотность «видит» пласт во время циркуляции.",
    applicability: "Контроль окна между пластовым давлением и градиентом гидроразрыва.",
    limitations: "Точность зависит от корректности расчёта затрубных потерь и профиля температуры.",
    fields: [
      field("mudDensity", "Плотность раствора", "Статическая плотность бурового раствора.", "1250 кг/м³", densityUnits, 500, 2600),
      field("annularLoss", "Потери в затрубье", "Расчётные потери давления от забоя до устья.", "2,4 МПа", pressureUnits, 0, 100),
      field("tvd", "Вертикальная глубина", "TVD точки, для которой оценивается ECD.", "3000 м", lengthUnits, 100, 15000),
      field("fracDensity", "Эквивалент гидроразрыва", "Предельная эквивалентная плотность из окна бурения.", "1650 кг/м³", densityUnits, 700, 3000),
    ],
    defaults: { mudDensity: 1250, annularLoss: 2.4, tvd: 3000, fracDensity: 1650 },
    validate(v) { const e = baseValidation(this.fields, v); if (v.fracDensity <= v.mudDensity) e.fracDensity = "Эквивалент гидроразрыва должен быть выше плотности раствора."; return e; },
    calculate(v) { const add = (v.annularLoss * 1e6) / (g * v.tvd); const value = v.mudDensity + add; const margin = v.fracDensity - value; const level: RiskLevel = margin < 0 ? "critical" : margin < 80 ? "warning" : "normal"; return { value, unit: "кг/м³", secondary: `Запас до гидроразрыва ${fmt(margin, 0)} кг/м³`, level, conclusion: level === "normal" ? "ECD находится ниже заданного эквивалента гидроразрыва." : level === "warning" ? "Запас по окну бурения мал." : "ECD превышает заданный предел гидроразрыва.", recommendation: level === "normal" ? "Продолжайте контролировать расход, реологию и шламовую нагрузку." : "Снизьте затрубные потери и немедленно сверьтесь с программой управления давлением.", steps: [`Добавка от потерь = ${fmt(v.annularLoss)} × 1 000 000 / (9,80665 × ${fmt(v.tvd, 0)}) = ${fmt(add, 0)} кг/м³.`, `ECD = ${fmt(v.mudDensity, 0)} + ${fmt(add, 0)} = ${fmt(value, 0)} кг/м³.`] }; },
  },
  {
    id: "string",
    category: "Колонна",
    title: "Вес колонны в жидкости",
    shortTitle: "Вес колонны",
    description: "Оценка плавучести и эффективного веса труб в растворе.",
    icon: "anchor",
    visual: "string",
    formula: "Wж = Wв × (1 − ρж / ρст)",
    physicalMeaning: "Жидкость создаёт выталкивающую силу и уменьшает показания веса колонны.",
    applicability: "Прикидка веса на крюке и осевых нагрузок.",
    limitations: "Не учитывает трение, наклон, давление на закрытые площади, изгиб и динамические нагрузки.",
    fields: [
      field("airWeight", "Вес колонны в воздухе", "Расчётный вес всей компоновки без учёта жидкости.", "850 кН", [{ label: "кН", factor: 1, decimals: 0 }, { label: "тс", factor: 9.80665, decimals: 1 }], 1, 10000),
      field("fluidDensity", "Плотность жидкости", "Средняя плотность жидкости вокруг колонны.", "1250 кг/м³", densityUnits, 500, 2600),
      field("steelDensity", "Плотность стали", "Для обычной стали обычно 7850 кг/м³.", "7850 кг/м³", densityUnits, 7000, 9000),
    ],
    defaults: { airWeight: 850, fluidDensity: 1250, steelDensity: 7850 },
    validate(v) { const e = baseValidation(this.fields, v); if (v.fluidDensity >= v.steelDensity) e.fluidDensity = "Плотность жидкости должна быть ниже плотности материала труб."; return e; },
    calculate(v) { const bf = 1 - v.fluidDensity / v.steelDensity; const value = v.airWeight * bf; return { value, unit: "кН", secondary: `Коэффициент плавучести ${fmt(bf, 3)}`, level: "normal", conclusion: "Получен теоретический эффективный вес колонны в жидкости.", recommendation: "Для веса на крюке добавьте модель трения и фактическую траекторию скважины.", steps: [`Коэффициент плавучести = 1 − ${fmt(v.fluidDensity, 0)} / ${fmt(v.steelDensity, 0)} = ${fmt(bf, 3)}.`, `Вес в жидкости = ${fmt(v.airWeight, 0)} × ${fmt(bf, 3)} = ${fmt(value, 1)} кН.`] }; },
  },
  {
    id: "rop",
    category: "Бурение",
    title: "Механическая скорость проходки",
    shortTitle: "ROP",
    description: "Чистая и календарная скорость проходки по интервалу.",
    icon: "trend",
    visual: "rop",
    formula: "ROP = ΔH / t",
    physicalMeaning: "Показывает, сколько метров пробурено за один час работы долота.",
    applicability: "Суточная отчётность, сравнение режимов и оценка эффективности долота.",
    limitations: "Для сравнения долот отделяйте чистое время бурения от СПО, промывок и простоев.",
    fields: [
      field("interval", "Пробуренный интервал", "Разница между конечной и начальной глубиной.", "240 м", lengthUnits, 0.1, 5000),
      field("drillTime", "Чистое время бурения", "Только время углубления с работающим долотом.", "12 ч", [{ label: "ч", factor: 1, decimals: 1 }, { label: "мин", factor: 1 / 60, decimals: 0 }], 0.01, 1000),
      field("totalTime", "Общее время операции", "Бурение плюс соединения, промывки и технологические остановки.", "18 ч", [{ label: "ч", factor: 1, decimals: 1 }, { label: "мин", factor: 1 / 60, decimals: 0 }], 0.01, 2000),
    ],
    defaults: { interval: 240, drillTime: 12, totalTime: 18 },
    validate(v) { const e = baseValidation(this.fields, v); if (v.totalTime < v.drillTime) e.totalTime = "Общее время не может быть меньше чистого времени бурения."; return e; },
    calculate(v) { const value = v.interval / v.drillTime; const gross = v.interval / v.totalTime; const efficiency = (v.drillTime / v.totalTime) * 100; return { value, unit: "м/ч", secondary: `Календарная ROP ${fmt(gross, 1)} м/ч · эффективность ${fmt(efficiency, 0)}%`, level: efficiency < 50 ? "warning" : "normal", conclusion: efficiency < 50 ? "Менее половины времени операции пришлось на чистое бурение." : "Доля чистого времени бурения находится на приемлемом уровне предварительной оценки.", recommendation: "Разберите непроизводительное время по категориям и сравните с соседними рейсами.", steps: [`Чистая ROP = ${fmt(v.interval, 0)} / ${fmt(v.drillTime, 1)} = ${fmt(value, 1)} м/ч.`, `Календарная ROP = ${fmt(v.interval, 0)} / ${fmt(v.totalTime, 1)} = ${fmt(gross, 1)} м/ч.`] }; },
  },
  {
    id: "power",
    category: "Оборудование",
    title: "Механическая мощность вращения",
    shortTitle: "Мощность",
    description: "Мощность по крутящему моменту и частоте вращения.",
    icon: "bolt",
    visual: "power",
    formula: "N = M × n / 9550",
    physicalMeaning: "Связывает крутящий момент на валу и частоту вращения с передаваемой мощностью.",
    applicability: "Оценка нагрузки верхнего привода, ротора или забойного двигателя.",
    limitations: "Расчёт не учитывает КПД трансмиссии, пиковые нагрузки и динамические колебания.",
    fields: [
      field("torque", "Крутящий момент", "Средний рабочий момент на валу.", "18 кН·м", [{ label: "кН·м", factor: 1, decimals: 1 }, { label: "Н·м", factor: 0.001, decimals: 0 }], 0, 200),
      field("rpm", "Частота вращения", "Средняя частота вращения колонны.", "120 об/мин", [{ label: "об/мин", factor: 1, decimals: 0 }], 0, 500),
      field("ratedPower", "Номинальная мощность", "Допустимая мощность оборудования по паспорту.", "400 кВт", [{ label: "кВт", factor: 1, decimals: 0 }, { label: "л.с.", factor: 0.735499, decimals: 0 }], 1, 5000),
    ],
    defaults: { torque: 18, rpm: 120, ratedPower: 400 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const value = (v.torque * v.rpm) / 9.55; const load = (value / v.ratedPower) * 100; const level: RiskLevel = load > 100 ? "critical" : load > 85 ? "warning" : "normal"; return { value, unit: "кВт", secondary: `Загрузка оборудования ${fmt(load, 0)}%`, level, conclusion: level === "normal" ? "Расчётная мощность ниже заданного номинала." : level === "warning" ? "Оборудование работает близко к заданному номиналу." : "Расчётная мощность превышает заданный номинал.", recommendation: level === "normal" ? "Контролируйте фактический момент и пиковые нагрузки." : "Снизьте момент или обороты и проверьте паспортные ограничения оборудования.", steps: [`Мощность = ${fmt(v.torque, 1)} × ${fmt(v.rpm, 0)} / 9,55 = ${fmt(value, 1)} кВт.`, `Загрузка = ${fmt(value, 1)} / ${fmt(v.ratedPower, 0)} × 100 = ${fmt(load, 0)}%.`] }; },
  },
  {
    id: "circulation",
    category: "Циркуляция",
    title: "Полный цикл циркуляции",
    shortTitle: "Циркуляция",
    description: "Время полного оборота жидкости и необходимое количество ходов насоса.",
    icon: "flow",
    visual: "flow",
    formula: "t = (Vвн + Vзат) / Q;  N = VΣ × 1000 / qₙ",
    physicalMeaning: "Жидкость проходит вниз внутри колонны и возвращается по затрубному пространству.",
    applicability: "Планирование промывки, замещения пачек, выхода шлама и контроля объёмов.",
    limitations: "Используйте фактическую производительность насоса и учитывайте сжимаемость при высоких давлениях.",
    fields: [
      field("insideVolume", "Объём внутри колонны", "Суммарная вместимость труб и КНБК.", "Например: 31 м³", [{ label: "м³", factor: 1, decimals: 2 }, { label: "bbl", factor: 0.1589873, decimals: 1 }], 0, 1000),
      field("annularVolume", "Объём затрубья", "Объём возвратного пути от забоя до устья.", "Например: 48 м³", [{ label: "м³", factor: 1, decimals: 2 }, { label: "bbl", factor: 0.1589873, decimals: 1 }], 0, 2000),
      field("flow", "Расход насоса", "Фактический суммарный расход.", "Например: 1,8 м³/мин", flowUnits, 0.01, 10),
      field("pumpOutput", "Подача за ход", "Калиброванная подача насоса с учётом коэффициента наполнения.", "Например: 18 л/ход", [{ label: "л/ход", factor: 1, decimals: 2 }, { label: "м³/ход", factor: 1000, decimals: 4 }], 0.01, 100),
    ],
    defaults: { insideVolume: 31, annularVolume: 48, flow: 1.8, pumpOutput: 18 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const total = v.insideVolume + v.annularVolume; const value = total / v.flow; const strokes = total * 1000 / v.pumpOutput; return { value, unit: "мин", secondary: `${fmt(strokes, 0)} ходов · объём ${fmt(total)} м³`, level: "normal", conclusion: "Рассчитано теоретическое время одного полного цикла циркуляции.", recommendation: "Для полевого контроля используйте фактический счётчик ходов и замер расхода.", steps: [`Полный объём = ${fmt(v.insideVolume)} + ${fmt(v.annularVolume)} = ${fmt(total)} м³.`, `Время = ${fmt(total)} / ${fmt(v.flow, 3)} = ${fmt(value, 1)} мин.`, `Ходы = ${fmt(total)} × 1000 / ${fmt(v.pumpOutput, 2)} = ${fmt(strokes, 0)}.`], metrics: [{ label: "Полный объём", value: `${fmt(total)} м³` }, { label: "Ходы насоса", value: fmt(strokes, 0) }, { label: "Время", value: `${fmt(value, 1)} мин` }] }; },
  },
  {
    id: "pump-strokes",
    category: "Насосы",
    title: "Ходы насоса для заданного объёма",
    shortTitle: "Ходы насоса",
    description: "Количество ходов, необходимое для закачки или продавки заданного объёма.",
    icon: "activity",
    visual: "flow",
    formula: "N = V × 1000 / qₙ",
    physicalMeaning: "Каждый ход насоса перемещает ограниченный откалиброванный объём жидкости.",
    applicability: "Закачка пачек, цементирование, продавка и контроль перемещения объёма.",
    limitations: "Подача должна учитывать диаметр втулок, длину хода, число цилиндров и фактический коэффициент наполнения.",
    fields: [
      field("volume", "Объём закачки", "Плановый объём жидкости.", "25 м³", [{ label: "м³", factor: 1, decimals: 2 }, { label: "bbl", factor: 0.1589873, decimals: 1 }], 0.001, 2000),
      field("pumpOutput", "Подача за ход", "Фактическая подача насоса.", "18 л/ход", [{ label: "л/ход", factor: 1, decimals: 2 }, { label: "м³/ход", factor: 1000, decimals: 4 }], 0.01, 100),
      field("spm", "Частота насоса", "Рабочее число ходов в минуту.", "100 ход/мин", [{ label: "ход/мин", factor: 1, decimals: 0 }], 1, 300),
    ],
    defaults: { volume: 25, pumpOutput: 18, spm: 100 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const value = v.volume * 1000 / v.pumpOutput; const time = value / v.spm; return { value, unit: "ходов", secondary: `При ${fmt(v.spm, 0)} ход/мин ≈ ${fmt(time, 1)} мин`, level: "normal", conclusion: "Получено расчётное количество ходов насоса.", recommendation: "Перед операцией подтвердите калибровку и коэффициент наполнения насоса.", steps: [`Ходы = ${fmt(v.volume)} × 1000 / ${fmt(v.pumpOutput, 2)} = ${fmt(value, 0)}.`, `Время = ${fmt(value, 0)} / ${fmt(v.spm, 0)} = ${fmt(time, 1)} мин.`] }; },
  },
  {
    id: "mixing",
    category: "Буровые растворы",
    title: "Смешение двух жидкостей",
    shortTitle: "Смешение жидкостей",
    description: "Итоговая плотность после смешения двух совместимых жидкостей.",
    icon: "layers",
    visual: "volume",
    formula: "ρсм = (ρ₁V₁ + ρ₂V₂) / (V₁ + V₂)",
    physicalMeaning: "Плотность смеси определяется массовым вкладом каждой жидкости.",
    applicability: "Приготовление пачек, разбавление и предварительная оценка замещения.",
    limitations: "Предполагается аддитивность объёмов и полное смешение без химической реакции.",
    fields: [
      field("volume1", "Объём жидкости 1", "Количество первой жидкости.", "20 м³", [{ label: "м³", factor: 1, decimals: 2 }, { label: "bbl", factor: 0.1589873, decimals: 1 }], 0, 2000),
      field("density1", "Плотность жидкости 1", "Измеренная плотность первой жидкости.", "1200 кг/м³", densityUnits, 100, 3000),
      field("volume2", "Объём жидкости 2", "Количество второй жидкости.", "10 м³", [{ label: "м³", factor: 1, decimals: 2 }, { label: "bbl", factor: 0.1589873, decimals: 1 }], 0, 2000),
      field("density2", "Плотность жидкости 2", "Измеренная плотность второй жидкости.", "1000 кг/м³", densityUnits, 100, 3000),
    ],
    defaults: { volume1: 20, density1: 1200, volume2: 10, density2: 1000 },
    validate(v) { const e = baseValidation(this.fields, v); if (v.volume1 + v.volume2 <= 0) e.volume1 = "Суммарный объём должен быть больше нуля."; return e; },
    calculate(v) { const total = v.volume1 + v.volume2; const mass = v.density1 * v.volume1 + v.density2 * v.volume2; const value = mass / total; return { value, unit: "кг/м³", secondary: `${fmt(value / 119.826427, 2)} ppg · объём ${fmt(total)} м³`, level: "normal", conclusion: "Рассчитана теоретическая плотность однородной смеси.", recommendation: "Проверьте химическую совместимость и подтвердите плотность лабораторным или полевым замером.", steps: [`Масса = ${fmt(v.density1, 0)} × ${fmt(v.volume1)} + ${fmt(v.density2, 0)} × ${fmt(v.volume2)} = ${fmt(mass, 0)} кг.`, `Плотность = ${fmt(mass, 0)} / ${fmt(total)} = ${fmt(value, 0)} кг/м³.`] }; },
  },
  {
    id: "weighting",
    category: "Буровые растворы",
    title: "Масса утяжелителя",
    shortTitle: "Утяжеление раствора",
    description: "Теоретическая масса сухого материала для повышения плотности системы.",
    icon: "anchor",
    visual: "volume",
    formula: "m = V(ρ₂ − ρ₁)ρᵤ / (ρᵤ − ρ₂)",
    physicalMeaning: "Добавляемый утяжелитель повышает массу и одновременно увеличивает объём раствора.",
    applicability: "Предварительная оценка потребности в барите или другом утяжелителе.",
    limitations: "Не учитывает влагу, потери, упаковку твёрдой фазы и изменение реологии.",
    fields: [
      field("systemVolume", "Объём системы", "Исходный объём раствора.", "120 м³", [{ label: "м³", factor: 1, decimals: 1 }, { label: "bbl", factor: 0.1589873, decimals: 0 }], 0.1, 5000),
      field("currentDensity", "Текущая плотность", "Плотность до утяжеления.", "1200 кг/м³", densityUnits, 500, 2600),
      field("targetDensity", "Требуемая плотность", "Целевая плотность после обработки.", "1350 кг/м³", densityUnits, 500, 3000),
      field("materialDensity", "Плотность утяжелителя", "Истинная плотность материала; для барита обычно около 4200 кг/м³.", "4200 кг/м³", densityUnits, 2000, 6000),
    ],
    defaults: { systemVolume: 120, currentDensity: 1200, targetDensity: 1350, materialDensity: 4200 },
    validate(v) { const e = baseValidation(this.fields, v); if (v.targetDensity <= v.currentDensity) e.targetDensity = "Требуемая плотность должна быть выше текущей."; if (v.targetDensity >= v.materialDensity) e.targetDensity = "Требуемая плотность должна быть ниже плотности утяжелителя."; return e; },
    calculate(v) { const value = v.systemVolume * (v.targetDensity - v.currentDensity) * v.materialDensity / (v.materialDensity - v.targetDensity); const finalVolume = v.systemVolume + value / v.materialDensity; return { value: value / 1000, unit: "т", secondary: `Ожидаемый объём после обработки ${fmt(finalVolume)} м³`, level: "normal", conclusion: "Рассчитана теоретическая масса сухого утяжелителя.", recommendation: "Добавляйте материал ступенчато и контролируйте плотность и реологию после каждого цикла.", steps: [`Масса = ${fmt(v.systemVolume, 1)} × (${fmt(v.targetDensity, 0)} − ${fmt(v.currentDensity, 0)}) × ${fmt(v.materialDensity, 0)} / (${fmt(v.materialDensity, 0)} − ${fmt(v.targetDensity, 0)}).`, `Получаем ${fmt(value / 1000)} т.`] }; },
  },
  {
    id: "hydraulic-power",
    category: "Гидравлика",
    title: "Гидравлическая мощность",
    shortTitle: "Гидромощность",
    description: "Мощность потока по перепаду давления и расходу.",
    icon: "bolt",
    visual: "flow",
    formula: "N = ΔP × Q / 60",
    physicalMeaning: "Показывает скорость передачи энергии от насосов потоку жидкости.",
    applicability: "Оценка мощности на долоте, насадках или участке циркуляционной системы.",
    limitations: "Для мощности оборудования дополнительно учитывайте механический и объёмный КПД.",
    fields: [
      field("pressureDrop", "Перепад давления", "Давление, на котором передаётся энергия потоку.", "15 МПа", pressureUnits, 0, 100),
      field("flow", "Расход", "Фактический расход жидкости.", "1,8 м³/мин", flowUnits, 0.001, 10),
      field("efficiency", "КПД", "Доля гидравлической мощности после потерь.", "85 %", [{ label: "%", factor: 1, decimals: 0 }], 1, 100),
    ],
    defaults: { pressureDrop: 15, flow: 1.8, efficiency: 85 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const raw = v.pressureDrop * v.flow * 16.6666667; const value = raw * v.efficiency / 100; return { value, unit: "кВт", secondary: `Теоретически ${fmt(raw, 1)} кВт · КПД ${fmt(v.efficiency, 0)}%`, level: "normal", conclusion: "Рассчитана доступная гидравлическая мощность потока.", recommendation: "Сопоставьте с паспортной мощностью насосов и допустимым рабочим давлением оборудования.", steps: [`Теоретическая мощность = ${fmt(v.pressureDrop)} × ${fmt(v.flow, 3)} × 16,6667 = ${fmt(raw, 1)} кВт.`, `С учётом КПД = ${fmt(raw, 1)} × ${fmt(v.efficiency, 0)}% = ${fmt(value, 1)} кВт.`] }; },
  },
  {
    id: "nozzles",
    category: "Гидравлика",
    title: "Насадки долота: TFA и скорость",
    shortTitle: "Насадки долота",
    description: "Суммарная площадь насадок и средняя скорость истечения.",
    icon: "circle",
    visual: "flow",
    formula: "TFA = nπd²/4;  v = Q / TFA",
    physicalMeaning: "Меньшая площадь насадок при том же расходе создаёт более высокую скорость струи и большие потери давления.",
    applicability: "Предварительный подбор насадок и контроль гидравлики долота.",
    limitations: "Для давления на насадках требуется коэффициент расхода и фактическая плотность жидкости.",
    fields: [
      field("nozzleCount", "Количество насадок", "Число одинаковых активных насадок.", "3 шт.", [{ label: "шт.", factor: 1, decimals: 0 }], 1, 20),
      field("nozzleDiameter", "Диаметр одной насадки", "Внутренний диаметр одной насадки.", "12,7 мм", diameterUnits, 1, 50),
      field("flow", "Расход", "Суммарный расход через все насадки.", "1,8 м³/мин", flowUnits, 0.001, 10),
    ],
    defaults: { nozzleCount: 3, nozzleDiameter: 12.7, flow: 1.8 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const tfa = v.nozzleCount * Math.PI / 4 * v.nozzleDiameter ** 2; const value = (v.flow / 60) / (tfa * 1e-6); const level: RiskLevel = value > 180 ? "warning" : "normal"; return { value, unit: "м/с", secondary: `TFA ${fmt(tfa, 1)} мм²`, level, conclusion: level === "normal" ? "Получена расчётная скорость через одинаковые насадки." : "Скорость струи высокая; требуется проверка эрозии и перепада давления.", recommendation: "Подтвердите конфигурацию по гидравлической программе и ограничениям долота.", steps: [`TFA = ${fmt(v.nozzleCount, 0)} × π/4 × ${fmt(v.nozzleDiameter, 2)}² = ${fmt(tfa, 1)} мм².`, `Скорость = (${fmt(v.flow, 3)} / 60) / (${fmt(tfa, 1)} × 10⁻⁶) = ${fmt(value, 1)} м/с.`], metrics: [{ label: "TFA", value: `${fmt(tfa, 1)} мм²` }, { label: "Расход", value: `${fmt(v.flow, 3)} м³/мин` }, { label: "Насадки", value: `${fmt(v.nozzleCount, 0)} × ${fmt(v.nozzleDiameter, 1)} мм` }] }; },
  },
  {
    id: "density-pressure",
    category: "Давления",
    title: "Плотность по давлению и глубине",
    shortTitle: "Плотность по давлению",
    description: "Эквивалентная плотность столба жидкости по известному давлению и TVD.",
    icon: "gauge",
    visual: "pressure",
    formula: "ρ = P × 10⁶ / (g × TVD)",
    physicalMeaning: "Определяет среднюю плотность жидкости, которая создаёт указанное гидростатическое давление.",
    applicability: "Обратная проверка гидростатики и перевод давления в эквивалент плотности.",
    limitations: "Давление должно быть гидростатическим; потери циркуляции и поверхностное давление необходимо исключить или учитывать отдельно.",
    fields: [
      field("pressure", "Гидростатическое давление", "Давление столба жидкости в точке расчёта.", "36,8 МПа", pressureUnits, 0.01, 300),
      field("tvd", "Вертикальная глубина TVD", "Истинная вертикальная глубина точки расчёта.", "3000 м", lengthUnits, 1, 15000),
    ],
    defaults: { pressure: 36.8, tvd: 3000 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const value = v.pressure * 1e6 / (g * v.tvd); return { value, unit: "кг/м³", secondary: `${fmt(value / 119.826427, 2)} ppg`, level: "normal", conclusion: "Получена эквивалентная средняя плотность гидростатического столба.", recommendation: "Убедитесь, что использовано TVD и из давления исключены динамические составляющие.", steps: [`Плотность = ${fmt(v.pressure)} × 1 000 000 / (9,80665 × ${fmt(v.tvd, 0)}).`, `Результат = ${fmt(value, 0)} кг/м³.`] }; },
  },
  {
    id: "circulating-bhp",
    category: "Давления",
    title: "Забойное давление при циркуляции",
    shortTitle: "BHP при циркуляции",
    description: "Сумма гидростатики и затрубных потерь давления на забое.",
    icon: "activity",
    visual: "ecd",
    formula: "BHPц = ρgTVD / 10⁶ + ΔPзат",
    physicalMeaning: "Во время циркуляции пласт ощущает статический столб жидкости плюс сопротивление возвратного потока.",
    applicability: "Проверка динамического забойного давления и окна бурения.",
    limitations: "Не включает нестационарные эффекты, surge/swab и изменение плотности по температуре.",
    fields: [
      field("mudDensity", "Плотность раствора", "Средняя статическая плотность.", "1250 кг/м³", densityUnits, 500, 2600),
      field("tvd", "Вертикальная глубина", "TVD точки расчёта.", "3000 м", lengthUnits, 1, 15000),
      field("annularLoss", "Потери в затрубье", "Расчётные потери давления от забоя до устья.", "2,4 МПа", pressureUnits, 0, 100),
      field("fracPressure", "Предел гидроразрыва", "Допустимое давление по программе работ.", "45 МПа", pressureUnits, 0.1, 300),
    ],
    defaults: { mudDensity: 1250, tvd: 3000, annularLoss: 2.4, fracPressure: 45 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const staticP = v.mudDensity * g * v.tvd / 1e6; const value = staticP + v.annularLoss; const margin = v.fracPressure - value; const level: RiskLevel = margin < 0 ? "critical" : margin < 2 ? "warning" : "normal"; return { value, unit: "МПа", secondary: `Статика ${fmt(staticP)} МПа · запас ${fmt(margin)} МПа`, level, conclusion: level === "normal" ? "Расчётное BHP ниже заданного предела." : level === "warning" ? "Запас по давлению мал." : "Расчётное BHP превышает заданный предел.", recommendation: level === "normal" ? "Контролируйте расход и реологию во время операции." : "Проверьте расход, плотность и затрубные потери до продолжения операции.", steps: [`Гидростатика = ${fmt(v.mudDensity, 0)} × 9,80665 × ${fmt(v.tvd, 0)} / 1 000 000 = ${fmt(staticP)} МПа.`, `BHP = ${fmt(staticP)} + ${fmt(v.annularLoss)} = ${fmt(value)} МПа.`], metrics: [{ label: "Гидростатика", value: `${fmt(staticP)} МПа` }, { label: "Потери", value: `${fmt(v.annularLoss)} МПа` }, { label: "Запас", value: `${fmt(margin)} МПа` }] }; },
  },
  {
    id: "cylinder-volume",
    category: "Объёмы",
    title: "Объём цилиндра и вместимость трубы",
    shortTitle: "Объём цилиндра",
    description: "Внутренний объём трубы, ёмкости или цилиндрического участка.",
    icon: "circle",
    visual: "volume",
    formula: "V = πD²L / 4",
    physicalMeaning: "Объём пропорционален длине и квадрату внутреннего диаметра.",
    applicability: "Вместимость обсадных и бурильных труб, объём ёмкостей и башмачных патрубков.",
    limitations: "Диаметр считается постоянным; муфты, высадки и внутреннее оборудование учитываются отдельно.",
    fields: [
      field("insideDiameter", "Внутренний диаметр", "Фактический внутренний диаметр цилиндрического канала.", "148,3 мм", diameterUnits, 1, 1500),
      field("length", "Длина", "Длина цилиндрического участка.", "3200 м", lengthUnits, 0.001, 20000),
    ],
    defaults: { insideDiameter: 148.3, length: 3200 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const capacity = Math.PI / 4 * (v.insideDiameter / 1000) ** 2; const value = capacity * v.length; return { value, unit: "м³", secondary: `Вместимость ${fmt(capacity, 5)} м³/м · ${fmt(value * 6.28981, 1)} bbl`, level: "normal", conclusion: "Рассчитан геометрический внутренний объём цилиндрического участка.", recommendation: "Для продавки используйте фактический внутренний диаметр и учитывайте объём оборудования внутри колонны.", steps: [`Вместимость = π/4 × ${fmt(v.insideDiameter / 1000, 4)}² = ${fmt(capacity, 5)} м³/м.`, `Объём = ${fmt(capacity, 5)} × ${fmt(v.length, 0)} = ${fmt(value)} м³.`] }; },
  },
  {
    id: "axial-strength",
    category: "Колонна",
    title: "Площадь металла и осевая прочность",
    shortTitle: "Осевая прочность",
    description: "Площадь сечения, осевое напряжение и использование предела текучести.",
    icon: "anchor",
    visual: "string",
    formula: "A = π(D² − d²)/4;  σ = F/A;  U = σ/σт",
    physicalMeaning: "Осевое усилие распределяется по площади металла трубы; меньшая площадь даёт большее напряжение.",
    applicability: "Предварительная проверка растяжения гладкого тела трубы.",
    limitations: "Не заменяет проверку соединений, burst/collapse, изгиба, усталости и комбинированных нагрузок.",
    fields: [
      field("outerDiameter", "Наружный диаметр", "Наружный диаметр тела трубы.", "168,3 мм", diameterUnits, 1, 1500),
      field("insideDiameter", "Внутренний диаметр", "Внутренний диаметр тела трубы.", "148,3 мм", diameterUnits, 0, 1499),
      field("axialForce", "Осевая сила", "Расчётное растягивающее усилие.", "1200 кН", [{ label: "кН", factor: 1, decimals: 0 }, { label: "тс", factor: 9.80665, decimals: 1 }], 0, 50000),
      field("yieldStrength", "Предел текучести", "Минимальный предел текучести материала трубы.", "758 МПа", [{ label: "МПа", factor: 1, decimals: 0 }, { label: "ksi", factor: 6.894757, decimals: 1 }], 1, 2000),
      field("allowableUtilization", "Допустимое использование", "Проектное ограничение по коэффициенту использования.", "80 %", [{ label: "%", factor: 1, decimals: 0 }], 1, 100),
    ],
    defaults: { outerDiameter: 168.3, insideDiameter: 148.3, axialForce: 1200, yieldStrength: 758, allowableUtilization: 80 },
    validate(v) { const e = baseValidation(this.fields, v); if (v.insideDiameter >= v.outerDiameter) e.insideDiameter = "Внутренний диаметр должен быть меньше наружного."; return e; },
    calculate(v) { const area = Math.PI / 4 * (v.outerDiameter ** 2 - v.insideDiameter ** 2); const value = v.axialForce * 1000 / area; const utilization = value / v.yieldStrength * 100; const level: RiskLevel = utilization > 100 ? "critical" : utilization > v.allowableUtilization ? "warning" : "normal"; return { value, unit: "МПа", secondary: `Площадь ${fmt(area, 0)} мм² · использование ${fmt(utilization, 1)}%`, level, conclusion: level === "normal" ? "Осевая нагрузка ниже заданного ограничения." : level === "warning" ? "Заданное проектное ограничение превышено." : "Расчётное напряжение превышает предел текучести.", recommendation: "Проведите полную проверку тела трубы и соединений по проектной методике комбинированных нагрузок.", steps: [`Площадь = π/4 × (${fmt(v.outerDiameter, 1)}² − ${fmt(v.insideDiameter, 1)}²) = ${fmt(area, 0)} мм².`, `Напряжение = ${fmt(v.axialForce, 0)} × 1000 / ${fmt(area, 0)} = ${fmt(value, 1)} МПа.`, `Использование = ${fmt(value, 1)} / ${fmt(v.yieldStrength, 0)} × 100 = ${fmt(utilization, 1)}%.`], metrics: [{ label: "Площадь металла", value: `${fmt(area, 0)} мм²` }, { label: "Использование", value: `${fmt(utilization, 1)}%` }, { label: "Ограничение", value: `${fmt(v.allowableUtilization, 0)}%` }] }; },
  },
  {
    id: "torque-from-power",
    category: "Оборудование",
    title: "Крутящий момент по мощности",
    shortTitle: "Момент по мощности",
    description: "Обратный расчёт крутящего момента по мощности и оборотам.",
    icon: "bolt",
    visual: "power",
    formula: "M = 9,55N / n",
    physicalMeaning: "При одной мощности снижение частоты вращения увеличивает доступный крутящий момент.",
    applicability: "Сопоставление режима вращения с возможностями привода.",
    limitations: "Используйте фактическую доступную мощность с учётом КПД и динамических ограничений.",
    fields: [
      field("power", "Мощность", "Доступная механическая мощность на валу.", "280 кВт", [{ label: "кВт", factor: 1, decimals: 0 }, { label: "л.с.", factor: 0.735499, decimals: 0 }], 0.01, 10000),
      field("rpm", "Частота вращения", "Частота вращения вала или колонны.", "120 об/мин", [{ label: "об/мин", factor: 1, decimals: 0 }], 0.1, 5000),
      field("torqueLimit", "Допустимый момент", "Ограничение оборудования или колонны.", "30 кН·м", [{ label: "кН·м", factor: 1, decimals: 1 }, { label: "Н·м", factor: 0.001, decimals: 0 }], 0.1, 1000),
    ],
    defaults: { power: 280, rpm: 120, torqueLimit: 30 },
    validate(v) { return baseValidation(this.fields, v); },
    calculate(v) { const value = 9.55 * v.power / v.rpm; const utilization = value / v.torqueLimit * 100; const level: RiskLevel = utilization > 100 ? "critical" : utilization > 85 ? "warning" : "normal"; return { value, unit: "кН·м", secondary: `Использование ограничения ${fmt(utilization, 0)}%`, level, conclusion: level === "normal" ? "Расчётный момент ниже заданного ограничения." : level === "warning" ? "Момент близок к заданному ограничению." : "Расчётный момент превышает заданное ограничение.", recommendation: "Проверьте паспортные ограничения привода, колонны и соединений.", steps: [`Момент = 9,55 × ${fmt(v.power, 1)} / ${fmt(v.rpm, 0)} = ${fmt(value, 1)} кН·м.`, `Использование = ${fmt(value, 1)} / ${fmt(v.torqueLimit, 1)} × 100 = ${fmt(utilization, 0)}%.`] }; },
  },
];

export const formulaIndex = [
  "Гидростатическое давление", "Плотность по давлению", "Плотность раствора глушения", "ECD", "Забойное давление при циркуляции",
  "Объём цилиндра", "Объём кольцевого пространства", "Вместимость труб", "Скорость потока в затрубье", "Время циркуляции",
  "Ходы насоса", "Смешение двух жидкостей", "Масса утяжелителя", "Коэффициент плавучести", "Вес колонны в жидкости",
  "Площадь металла трубы", "Осевая нагрузка", "Мощность вращения", "Крутящий момент", "Гидравлическая мощность",
  "Суммарная площадь насадок TFA", "Скорость в насадках", "Механическая скорость проходки", "Цементный объём",
];

export { fmt };
