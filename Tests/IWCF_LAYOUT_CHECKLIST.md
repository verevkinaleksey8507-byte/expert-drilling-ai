# IWCF Kill Sheet Layout Acceptance Checklist

## Workbook integrity

- [x] `Excel/ExpertSupervisor.xlsm` is a valid macro-enabled OOXML workbook.
- [x] The workbook contains exactly one visible worksheet.
- [x] The worksheet name is exactly `IWCF Kill Sheet`.
- [x] The workbook contains no VBA project.
- [x] The worksheet contains no formulas.
- [x] The worksheet contains no spreadsheet error values.

## Layout

- [x] The form is divided into two visually distinct pages.
- [x] All visible operational text is Russian.
- [x] English abbreviations are accompanied by Russian parameter names.
- [x] Metric units are stated beside the relevant fields.
- [x] Manual input fields are visually distinct from future calculated fields.
- [x] Section titles, borders and fills form a consistent visual hierarchy.
- [x] Long labels are wrapped and visible in the rendered workbook.
- [x] Both pages pass visual render review without overlapping content.

## Stage boundary

- [x] No engineering calculations are implemented.
- [x] No automatic validation is implemented.
- [x] No VBA or control automation is implemented.
- [x] The form visibly states its Stage 2 limitation.
