# Excel Application

`ExpertSupervisor.xlsm` is the Excel application entry point for Expert Drilling AI.

Version `0.3.0` contains one worksheet named `IWCF Kill Sheet` with a two-page Russian-language calculation form for a vertical well with a surface BOP stack.

The workbook currently contains:

- well, formation-strength, pump and circulation-data sections;
- drill-string and annular-volume tables;
- kick-data and formula-driven calculated-value fields;
- a ten-interval pressure-reduction schedule;
- an operational plan and approval section;
- semantic field colors: yellow for input and grey for calculated output;
- numeric data validation and visible calculation-status warnings.

Version `0.3.0` contains 96 formulas and intentionally contains no VBA.

Calculated values must be independently verified before operational use. The
workbook does not replace an approved organisation kill sheet.
