# Coding Standards

These standards apply when source code is introduced. No VBA or automation is implemented in version `0.1.0`.

## General

- Use English, descriptive identifiers.
- Keep each procedure or function focused on one responsibility.
- Replace unexplained literal values with named constants or enumerations.
- Separate domain rules, validation, calculation, presentation and persistence.
- Document public interfaces, inputs, outputs, units and failure modes.
- Handle errors explicitly and provide actionable user messages.
- Prefer deterministic logic and avoid dependence on active workbook state.

## VBA

- `Option Explicit` is mandatory in every module.
- Use explicit variable types; use `Variant` only with documented justification.
- Do not use `Select`, `Activate`, `ActiveSheet` or unqualified `Range`/`Cells`.
- Qualify every workbook, worksheet and range reference.
- Keep business rules out of worksheet and UserForm event handlers.
- Prefer bulk range reads/writes over cell-by-cell loops.
- Centralize error handling and logging.
- Do not suppress errors with unbounded `On Error Resume Next`.
- Export every module to `VBA/` for code review.

## Naming

| Element | Convention | Example |
|---|---|---|
| Standard module | `mod` prefix | `modWellControl` |
| Class module | `cls` prefix | `clsKillSheet` |
| UserForm | `frm` prefix | `frmProjectData` |
| Test module | `tst` prefix | `tstPressureCalculations` |
| Constant | PascalCase with clear meaning | `MaxAllowedPressure` |

## Comments

Comments must explain engineering intent, constraints or non-obvious decisions. They must not merely restate the code.

