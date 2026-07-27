# IWCF Kill Sheet Calculation Acceptance Checklist

## Workbook integrity

- [x] `Excel/ExpertSupervisor.xlsm` is a valid macro-enabled OOXML workbook.
- [x] The workbook contains exactly one visible sheet named `IWCF Kill Sheet`.
- [x] The workbook opens at the beginning of the visible form.
- [x] The workbook contains 96 formulas.
- [x] The workbook contains 60 data-validation rules.
- [x] The workbook contains 3 conditional-format warnings.
- [x] The workbook contains no VBA project.
- [x] The final formula-error scan returns no spreadsheet errors.

## Independent test vector

Core inputs:

| Input | Value |
|---|---:|
| Casing-shoe TVD | 1900 m |
| Test mud density | 1.200 kg/l |
| Test pressure | 50 bar |
| Bit TVD | 2900 m |
| Current mud density | 1.200 kg/l |
| Pump displacement | 20 l/stroke |
| Slow-circulation pressure | 40 bar |
| SIDPP | 30 bar |
| SICP | 40 bar |

Expected results:

| Result | Expected | Verified |
|---|---:|:---:|
| Equivalent density at shoe | 1.468255 kg/l | [x] |
| Fracture-pressure margin | 50.000 bar | [x] |
| Kill mud density | 1.305452 kg/l | [x] |
| Initial circulating pressure | 70.000 bar | [x] |
| Final circulating pressure | 43.515 bar | [x] |
| Formation pressure | 371.388 bar | [x] |
| Calculated pressure at shoe | 263.668 bar | [x] |

## Schedule checks

- [x] Point 0 equals initial circulating pressure.
- [x] Point 10 equals final circulating pressure.
- [x] Pump strokes increase monotonically from 0 to strokes-to-bit.
- [x] Pumped volume equals rounded pump strokes multiplied by pump displacement.
- [x] Drillpipe pressure decreases monotonically across the ten intervals.

## Visual checks

- [x] Both pages render with no clipped titles or calculation labels.
- [x] Yellow input cells and grey calculated cells remain distinguishable.
- [x] The final `.xlsm` round-trip render matches the generated workbook.
- [x] Formula and validation additions do not shift the two-page layout.

## Operational boundary

- [x] The workbook states that it does not replace an approved organisation form.
- [x] The workbook requires independent verification before operational use.
- [x] VBA and company-specific approval automation remain out of scope.
