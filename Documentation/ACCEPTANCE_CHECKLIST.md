# Foundation Acceptance Checklist

This checklist records the accepted `0.1.0` foundation baseline. The current
`0.3.0` calculation stage is verified by
`Tests/IWCF_CALCULATION_CHECKLIST.md`. The statements below are historical
acceptance criteria for the original empty-workbook milestone.

## Repository

- [ ] `Excel/`, `Documentation/`, `Templates/`, `Images/`, `VBA/` and `Tests/` exist and are tracked.
- [ ] Existing web and desktop application files are not modified.
- [ ] Changes are committed on a dedicated branch, not directly on `main`.
- [ ] A Pull Request targets `main`.

## Workbook

- [ ] `Excel/ExpertSupervisor.xlsm` is a valid macro-enabled OOXML workbook.
- [ ] It opens without a format or repair warning in desktop Excel.
- [ ] It contains exactly one visible worksheet.
- [ ] The worksheet name is exactly `IWCF Kill Sheet`.
- [ ] The worksheet contains no implemented layout or cell content.
- [ ] The workbook contains no formulas or calculations.
- [ ] The workbook contains no VBA project, modules, forms or automation.
- [ ] The workbook contains no charts, shapes, images or controls.
- [ ] The workbook contains no external links, queries or data connections.

## Documentation

- [ ] Project purpose and intended users are documented.
- [ ] Future modules are documented.
- [ ] Architecture and module boundaries are documented.
- [ ] Development and review rules are documented.
- [ ] Coding and Excel standards are documented.
- [ ] Versioning rules are documented.
- [ ] Current scope and deferred work are explicit.

## Scope control

- [ ] No IWCF Kill Sheet layout has been drawn.
- [ ] No engineering calculations have been implemented.
- [ ] No VBA or automation has been implemented.
