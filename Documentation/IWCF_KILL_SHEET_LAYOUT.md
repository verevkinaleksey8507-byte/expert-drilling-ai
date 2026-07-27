# IWCF Kill Sheet Layout

## Status

Stage 2 layout baseline for Expert Drilling AI version `0.2.0`.

## Scope

The `IWCF Kill Sheet` worksheet is a two-page Russian-language working layout
for a vertical well with a surface BOP stack using metric units:

- pressure: bar;
- volume: litre;
- fluid density: kg/l;
- depth: metre;
- diameter: millimetre;
- pump displacement: litre per stroke.

The layout follows the functional sequence of the public IWCF Russian
BL `0.0981` surface vertical kill sheet:

`https://www.iwcf.org/wp-content/uploads/2026/05/EX-0183-Surface-Vertical-Kill-Sheet-Russian-BL-0.0981.pdf`

The Expert Drilling AI workbook is an independent working implementation. It
does not represent an IWCF-issued form and does not replace an organisation's
approved well-control documentation.

## Page 1

Page 1 contains:

1. document identification;
2. formation-strength and current-well data;
3. pump, surface-line and circulation data;
4. drill-string and annular capacity/volume table;
5. summary circulation volumes and pump strokes.

## Page 2

Page 2 contains:

1. kick data after well shut-in;
2. reserved calculated control values;
3. pressure-reduction schedule;
4. operational plan and execution control;
5. verification and approval.

## Visual conventions

- dark blue bands identify major sections;
- pale yellow cells are manual input fields;
- grey cells are reserved for calculated results in a later stage;
- pale blue cells identify labels and table headers;
- red notices state that calculations and automatic checks are not yet
  implemented.

## Deferred work

The following work is explicitly outside Stage 2:

- engineering formulas;
- automatic calculations;
- data validation and limit checks;
- VBA;
- buttons, forms and navigation automation;
- protection and role-based editing;
- final company-specific branding;
- production approval for field use.
