export type WellSection = {
  id: string;
  active: boolean;
  name: string;
  casingOD: number;
  casingID: number;
  holeDiameter: number;
  shoeDepth: number;
  topDepth: number;
  linearMass: number;
  cavernosity: number;
};

export type WellProfile = {
  id: string;
  name: string;
  field: string;
  pad: string;
  wellNumber: string;
  purpose: string;
  wellType: string;
  projectDepth: number;
  currentBottom: number;
  md: number;
  tvd: number;
  altitude: number;
  organization: string;
  contractor: string;
  engineer: string;
  note: string;
  mudDensity: number;
  slurryDensity: number;
  bufferDensity: number;
  displacementDensity: number;
  plasticViscosity: number;
  yieldPoint: number;
  sections: WellSection[];
  updatedAt: string;
};

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `well-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createDefaultWell = (seed = makeId()): WellProfile => ({
  id: seed,
  name: "Демонстрационная скважина № 1",
  field: "Учебное месторождение",
  pad: "Куст 12",
  wellNumber: "1247",
  purpose: "Эксплуатационная",
  wellType: "Наклонно-направленная",
  projectDepth: 3600,
  currentBottom: 3500,
  md: 3500,
  tvd: 3180,
  altitude: 142,
  organization: "Заказчик",
  contractor: "Буровой подрядчик",
  engineer: "Инженер по бурению",
  note: "Демонстрационный набор данных. Перед рабочим расчётом замените проектными значениями.",
  mudDensity: 1250,
  slurryDensity: 1850,
  bufferDensity: 1450,
  displacementDensity: 1200,
  plasticViscosity: 28,
  yieldPoint: 12,
  updatedAt: new Date().toISOString(),
  sections: [
    { id: `${seed}-section-1`, active: true, name: "Направление", casingOD: 508, casingID: 480, holeDiameter: 660.4, shoeDepth: 60, topDepth: 0, linearMass: 155, cavernosity: 1.1 },
    { id: `${seed}-section-2`, active: true, name: "Кондуктор", casingOD: 324, casingID: 292, holeDiameter: 393.7, shoeDepth: 650, topDepth: 0, linearMass: 94, cavernosity: 1.12 },
    { id: `${seed}-section-3`, active: true, name: "Промежуточная колонна", casingOD: 244.5, casingID: 220.5, holeDiameter: 295.3, shoeDepth: 2100, topDepth: 0, linearMass: 70, cavernosity: 1.18 },
    { id: `${seed}-section-4`, active: true, name: "Эксплуатационная колонна", casingOD: 168.3, casingID: 148.3, holeDiameter: 215.9, shoeDepth: 3200, topDepth: 0, linearMass: 35.7, cavernosity: 1.2 },
  ],
});

export const cloneWell = (source: WellProfile): WellProfile => ({
  ...source,
  id: makeId(),
  name: `${source.name} — копия`,
  updatedAt: new Date().toISOString(),
  sections: source.sections.map((section) => ({ ...section, id: makeId() })),
});

export const activeSection = (well: WellProfile) =>
  [...well.sections]
    .filter((section) => section.active)
    .sort((a, b) => b.shoeDepth - a.shoeDepth)[0];

export const wellValuesForModule = (
  well: WellProfile,
  moduleId: string,
): Record<string, number> => {
  const section = activeSection(well);
  const common = {
    totalDepth: well.currentBottom || well.projectDepth,
    tvd: well.tvd,
    mudDensity: well.mudDensity,
    density: well.mudDensity,
    slurryDensity: well.slurryDensity,
    holeDiameter: section?.holeDiameter,
    pipeOD: section?.casingOD,
    casingOD: section?.casingOD,
    casingID: section?.casingID,
    insideDiameter: section?.casingID,
    outerDiameter: section?.casingOD,
    length: section?.shoeDepth,
    shoeDepth: section?.shoeDepth,
  };
  const allowed: Record<string, string[]> = {
    cement: ["totalDepth", "shoeDepth", "holeDiameter", "casingOD", "casingID", "slurryDensity"],
    hydrostatic: ["density", "tvd"],
    annulus: ["holeDiameter", "pipeOD"],
    hydraulics: ["holeDiameter", "pipeOD"],
    "kill-mud": ["mudDensity", "tvd"],
    ecd: ["mudDensity", "tvd"],
    "density-pressure": ["tvd"],
    "circulating-bhp": ["mudDensity", "tvd"],
    "cylinder-volume": ["insideDiameter", "length"],
    "axial-strength": ["outerDiameter", "insideDiameter"],
    string: ["fluidDensity"],
  };
  return Object.fromEntries(
    (allowed[moduleId] || [])
      .map((key) => [key, common[key as keyof typeof common]])
      .filter(([, value]) => Number.isFinite(value)),
  );
};
