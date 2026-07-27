# Versioning

Expert Drilling AI follows Semantic Versioning: `MAJOR.MINOR.PATCH`.

## Version meaning

- `0.x.y` — active pre-release development.
- `MAJOR` — incompatible application, workbook or stored-data changes.
- `MINOR` — backward-compatible modules or capabilities.
- `PATCH` — backward-compatible corrections and maintenance.

## Initial version

`0.1.0` is the project-foundation milestone. It establishes the repository modules, governance documentation and empty macro-enabled workbook.

## Current development version

`0.3.0` is the IWCF Kill Sheet calculation milestone. It adds traceable
engineering formulas, numeric input validation, pressure-limit warnings and a
ten-interval pressure-reduction schedule to the accepted two-page layout.

VBA and UI automation remain deferred.

## Release rules

- Do not tag or publish a release until its Pull Request is reviewed and accepted.
- Keep release notes, documentation and workbook metadata synchronized.
- Identify engineering-rule changes explicitly in release notes.
- Record corrected defects and affected calculations.
- Preserve previous accepted releases for traceability.

## Git conventions

- Branches: `agent/<scope>` for agent-led changes.
- Commits: concise imperative description of the complete change.
- Pull Requests: one scope, clear impact and validation evidence.
- Default branch: `main`; direct commits are prohibited.
