# IWCF Kill Sheet Calculations

## Status

Stage 3 calculation baseline for Expert Drilling AI version `0.3.0`.

## Controlled sources

The calculation relationships use the official IWCF Russian Metric BL 0.0981
formula sheet:

`https://www.iwcf.org/wp-content/uploads/2025/11/EX-0054-Drilling-Russian-BL-0.0981-Formula-Sheet_New.pdf`

The worksheet structure references the official Russian surface vertical kill
sheet EX-0183:

`https://www.iwcf.org/for-learners/learning-resources/`

The workbook is an independent working implementation and is not an
IWCF-issued form.

## Formula set

| Result | Workbook relationship |
|---|---|
| Equivalent density at casing shoe | test mud density + test pressure / (0.0981 × shoe TVD) |
| Fracture-pressure margin | (equivalent density − current mud density) × 0.0981 × shoe TVD |
| Maximum allowable surface pressure | lesser of fracture-pressure margin and entered casing-pressure limit |
| Internal capacity | 0.0007853981634 × inside diameter² |
| Annular capacity | 0.0007853981634 × (outer boundary diameter² − pipe outside diameter²) |
| Interval volume | interval length × capacity |
| Pump strokes | volume / pump displacement |
| Kill mud density | current mud density + SIDPP / (0.0981 × bit TVD) |
| Initial circulating pressure | slow-circulation pressure + SIDPP |
| Final circulating pressure | kill mud density / current mud density × slow-circulation pressure |
| Formation pressure | current mud density × 0.0981 × bit TVD + SIDPP |
| Pressure schedule | linear reduction from initial to final circulating pressure over ten intervals to the bit |

Diameters are entered in millimetres and capacities are returned in litres per
metre. Depths are entered in metres, pressures in bar, densities in kilograms
per litre and pump displacement in litres per stroke.

## Input control

The workbook validates realistic broad numeric ranges for:

- depths and interval endpoints;
- fluid densities;
- pressures;
- pump displacement and rate;
- diameters;
- volumes and stabilisation time.

The status band detects missing mandatory inputs, invalid depth relationships
and calculated pressure above entered casing or pump limits. These controls are
error-reduction aids, not an operating-envelope approval.

## Calculation behaviour

- Formula fields remain blank until their required inputs are available.
- The active worksheet and initial visible cell are set to the beginning of the
  form.
- The workbook contains one visible worksheet and no VBA project.
- Excel recalculates formula outputs after input changes.
- The pressure-reduction schedule uses calculated strokes to bit and includes
  points 0 through 10.

## Operational boundary

Every completed kill sheet must be checked against approved company
procedures, current well data and an independent well-control calculation.
Safety-critical decisions must not rely on this workbook alone.
