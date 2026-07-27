# Development Rules

## Change management

1. Do not commit directly to `main`.
2. Use one clearly scoped branch and Pull Request per change.
3. Keep engineering-rule changes separate from unrelated refactoring.
4. Review the complete diff and the workbook acceptance evidence before merge.
5. Update documentation and tests in the same change as the affected module.

## Engineering requirements

- Do not implement a formula without a traceable technical source.
- State units, assumptions, applicability limits and expected precision.
- Validate all user inputs before use.
- Do not silently correct or substitute invalid engineering inputs.
- User-facing errors must explain what is wrong and what must be corrected.
- Treat warning thresholds separately from hard validation limits.
- Avoid undocumented dependencies, external links and hidden data sources.
- Preserve backward compatibility unless an incompatible change is explicitly approved and versioned.

## Safety-critical changes

Well-control and other safety-critical changes require:

1. domain review;
2. independent calculation or reference-case comparison;
3. boundary and invalid-input testing;
4. documented reviewer approval before release.

## Definition of done

A module is complete only when its functional scope, sources, implementation, validation, test cases, review evidence and user documentation are all present and consistent.

