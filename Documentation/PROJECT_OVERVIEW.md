# Expert Drilling AI — Project Overview

## Purpose

Expert Drilling AI is a modular engineering application for drilling engineers and drilling supervisors. Its purpose is to provide controlled, auditable and practical tools for engineering calculations, well-control workflows, field supervision and technical reporting.

The product is not an Excel template. Excel is the first application platform and will be developed as a governed engineering software product.

## Intended users

- drilling engineers;
- drilling supervisors and senior drilling supervisors;
- well-control specialists and instructors;
- engineering reviewers and quality-assurance specialists.

## Future modules

1. IWCF Kill Sheets.
2. Drilling calculations.
3. Cementing calculations.
4. Hydraulics.
5. Well control.
6. Supervisor checklists.
7. Engineering library.
8. Reporting.
9. VBA automation.

## Current milestone

Version `0.3.0` implements the first calculation and input-control baseline for
the IWCF Kill Sheet:

- one two-page Russian-language worksheet named `IWCF Kill Sheet`;
- controlled yellow input fields and grey calculated fields;
- formation-strength, pressure, capacity, volume and pump-stroke calculations;
- kill-mud density, initial and final circulating pressure calculations;
- a ten-interval drillpipe-pressure reduction schedule;
- numeric input validation, limit warnings and calculation-state messages;
- traceable source references and a documented independent test vector.

## Explicitly out of scope

This milestone contains no VBA, buttons, forms, external data connections or
company-specific approval logic. It remains an engineering working tool and
does not replace an approved organisation kill sheet or an independent
well-control calculation.
