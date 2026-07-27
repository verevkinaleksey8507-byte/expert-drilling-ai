# Excel Standards

These standards govern future workbook development. Version `0.1.0` intentionally contains no worksheet layout or calculations.

## Workbook structure

- Control and document workbook and worksheet names.
- Do not create hidden assumptions or undocumented helper logic.
- Do not use external workbook links.
- Do not add queries or data connections without architectural approval.
- Support current Windows and macOS desktop Excel where technically possible.
- Avoid volatile formulas unless justified and tested.

## Engineering inputs and outputs

- Display the unit beside every engineering input and output.
- Store values as numbers, not text containing unit labels.
- Define permissible ranges and validation messages for user inputs.
- Distinguish inputs, calculated values, warnings and errors consistently.
- Do not hardcode engineering constants inside calculation formulas.
- Show precision appropriate to the source data and engineering decision.
- Do not imply false accuracy through excessive decimal places.
- Ensure decimal separators and regional settings do not alter results.

## Layout and usability

- Use a consistent visual hierarchy and restrained color system.
- Avoid merged cells in input and calculation areas.
- Use data validation where it reduces input error.
- Protect formulas and controlled areas without blocking intended user actions.
- Define print areas, scaling, page breaks and repeated headings for completed printable modules.
- Keep navigation usable at common screen sizes and zoom levels.

## Formula quality

- Keep formulas legible and auditable.
- Use named, controlled assumptions instead of magic numbers.
- Avoid unnecessary duplication of calculation logic.
- Prevent circular references.
- Handle zero, negative, blank and boundary inputs explicitly.
- Test formula results against independent reference cases.

## Automation

When VBA is introduced, workbook functionality must not depend on selecting or activating cells. Automation must fail safely and must never conceal invalid engineering data.

