# Version 1 verification status

**Documentation reconciliation date:** 2026-09-07  
**Current repository basis:** the supplied `systems-for-modern-ai.zip` reviewed in this pass.

## Scope

This document summarizes the **current repository verification state** without treating older generated release reports as current evidence. Historical 2026-08-28 report artifacts remain under `reports/release/` and describe the pre-Product/Anatomy snapshot; their 1.3.0/36-property/37-runtime-file/8-test counts are not current repository counts.

A gate is marked **PASS** only when it was executed successfully against the current repository or is directly supported by a current generated report. Environment-dependent gates that were not rerun remain **PENDING / ENVIRONMENT** rather than inferred as passes.

## Current gate results

| Gate | Current result | Evidence / note |
|---|---|---|
| Canonical RSC validation | **PASS** | 16 system YAML files / 18 configurations; active schema 1.4.0; current authored distribution is 8 files / 9 configurations on 1.4.0 and 8 files / 9 configurations on 1.2.0; zero errors. |
| Product / Anatomy validation | **PASS** | Product Catalog + Anatomy contract validation passes; 3/3 dedicated Python tests pass. |
| Canonical Concept validation | **PASS** | 15 canonical Concepts; zero canonical warnings/errors. |
| Concept validator unit tests | **PASS** | 9/9 Python validator tests. |
| RSC ↔ Concept compatibility | **PASS with expected migration warnings** | Zero errors; 27 legacy Concept-link warnings remain on later-candidate sources outside the five-system Version-1 user-facing set. |
| Initial-five V1 validation | **PASS** | 5 systems, 15 Concepts, 45 Property Definitions, zero errors. |
| Runtime generation / determinism | **PASS** | 54 generated runtime artifacts compare deterministically and validate with zero runtime-integrity errors. |
| Branch coverage audit | **PASS** | 75 audited branches, zero errors. |
| Physical-orientation readiness audit | **PASS (mechanical content gate)** | 65 entered contexts checked, zero errors under RDY-018. |
| Property conformance fixtures | **PASS** | 5/5 exact decimal/property fixtures. |
| Renderer density benchmark | **PASS for current V1 representative scenes in Chromium** | Current benchmark concludes no dense Canvas/WebGL backplane or renderer virtualization is required; Anatomy Depictions create zero focus targets. |
| Overall content/readiness tool | **CONTENT PASS; SHIP-READY PENDING** | Zero content errors. Pending release evidence: Documentation Confidence artifact and dependency-backed cross-browser E2E. |
| Dependency-backed TypeScript / Vitest / Vite | **PENDING / ENVIRONMENT** | `node_modules` is not included in the snapshot and this offline review environment cannot fetch npm packages. No pass is inferred. |
| Playwright Chromium / Firefox / WebKit | **PENDING / ENVIRONMENT** | Approved three-engine verification must be rerun in an environment with project dependencies and browser binaries installed. |

The current Python/content result can be reproduced with:

```text
python scripts/content/validate_all.py
```

## Remaining release-evidence gaps

1. **Documentation Confidence evidence:** the shared repository does not contain the candidate-comparison ratings artifact needed to reproduce the Source-of-Truth requirement that detailed initial systems have Documentation Confidence ≥ 3. The readiness tool correctly records this as unavailable rather than inventing a score.
2. **Dependency-backed browser/client verification:** TypeScript/Vitest/Vite/Playwright gates must be run in a normal dependency-capable environment. The populated `package-lock.json` supports `npm ci`; network access or a populated npm cache is still needed to fetch missing packages.
3. **Three-engine rendering/E2E evidence:** the current density benchmark used Chromium. Firefox/WebKit behavior remains part of the established release test policy.

These are verification/evidence gaps; they do not authorize changing established product behavior or weakening readiness requirements.

## Historical report artifacts

The following files are retained as historical evidence and should not be read as the current post-1.4.0 release state:

- `reports/release/release-verification.json`
- `reports/release/fresh-copy-verification.txt`
- older baseline validator/test snapshots under `reports/baseline/` and `content/concepts/*_run.txt`

Regenerate release/report artifacts after the next full dependency-capable verification rather than editing generated evidence to match documentation.
