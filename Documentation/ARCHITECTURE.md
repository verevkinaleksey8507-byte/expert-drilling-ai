# Architecture

## Architectural principles

Expert Drilling AI uses a modular architecture so that engineering rules, user interface, calculation logic, automation and verification can evolve independently.

The workbook is the distributable application. Exported source code, test assets and technical documentation are maintained outside the binary workbook to make changes reviewable and auditable.

## Repository modules

| Path | Responsibility |
|---|---|
| `Excel/` | Distributable Excel application workbooks |
| `Documentation/` | Product, architecture, development and maintenance documentation |
| `Templates/` | Reusable engineering and reporting templates |
| `Images/` | Controlled icons, diagrams and other visual assets |
| `VBA/` | Exported VBA source modules when automation is introduced |
| `Tests/` | Manual and automated QA assets, fixtures and expected results |

## Required separation

- Worksheet presentation must not become the source of engineering rules.
- Calculation logic must be separated from UI event handling.
- Validation must be separated from calculation and presentation logic.
- Each engineering module must be independently testable.
- Shared constants, units and conversion factors must have one controlled source.
- Reporting must consume verified outputs and must not recalculate engineering results independently.

## Engineering traceability

Every future calculation must identify:

- authoritative source;
- formula and variables;
- units and conversion rules;
- assumptions and operating limits;
- input validation rules;
- expected precision;
- independent verification cases.

Safety-critical well-control logic requires review by a qualified drilling engineer or IWCF well-control specialist and an independent QA reviewer.

## Binary workbook governance

The workbook is a deliverable, not the sole source of truth. When VBA is introduced, exported text source in `VBA/` must accompany workbook changes. Completed engineering modules must also include corresponding documentation and test evidence.

