# Version 1 release verification report

**Release handoff date:** 2026-08-28

## Scope

This report records the release-verification state of the complete handoff repository. A gate is marked **PASS** only when it actually executed successfully in the assembly environment. Network-dependent gates that could not execute are marked **ENVIRONMENT BLOCKED**, not inferred as passes.

## Gate results

| Gate | Result | Evidence / note |
|---|---|---|
| Canonical RSC validation | **PASS** | 16 system YAML files / 18 configurations; mixed 1.2.0 + initial-five 1.3.0; zero errors. |
| Canonical Concept validation | **PASS** | 15 canonical Concepts; zero warnings/errors. |
| Concept validator unit tests | **PASS** | 8/8 Python validator tests. |
| RSC ↔ Concept compatibility | **PASS with expected migration warnings** | Zero errors. 27 legacy Concept-link warnings are confined to later-candidate systems and do not enter the V1 user experience. |
| Initial-five V1 migration validation | **PASS** | 5 systems, 15 Concepts, 36 Property definitions, zero errors. |
| Runtime generation | **PASS** | Deterministic runtime JSON generated and mirrored to `public/runtime/`. |
| Runtime determinism | **PASS** | 37 generated runtime files compare deterministically. |
| Runtime referential/integrity validation | **PASS** | 37 files, zero errors. |
| Property conformance fixtures | **PASS** | 5/5 exact decimal/property fixtures. |
| Content-readiness audit | **PASS for executable content gates** | Zero content errors. External Documentation Confidence evidence remains unavailable. |
| Fallback TypeScript parser/strict-core check | **PASS** | Global TypeScript compiler plus local declaration shims parses/types the project core after source fixes. This is supplementary, not a substitute for the pinned dependency-backed gate. |
| `npm install` | **ENVIRONMENT BLOCKED** | Assembly sandbox cannot resolve `registry.npmjs.org` (DNS/network egress unavailable). |
| Playwright browser installation | **ENVIRONMENT BLOCKED** | Requires npm package installation and browser downloads; sandbox egress unavailable. |
| Pinned `npm run typecheck` | **ENVIRONMENT BLOCKED** | Pinned TypeScript package cannot be installed in this sandbox. |
| Vitest | **ENVIRONMENT BLOCKED** | Pinned dependencies cannot be installed in this sandbox. |
| Vite production build | **ENVIRONMENT BLOCKED** | Pinned dependencies cannot be installed in this sandbox. |
| Playwright Chromium/Firefox/WebKit | **ENVIRONMENT BLOCKED** | Pinned Playwright package/browser binaries cannot be installed in this sandbox. |
| Clean ZIP extraction — Python generation/validation | **PASS** | The archive was extracted to a new directory; runtime generation, complete Python validation, determinism, runtime integrity, property fixtures, and readiness audit all reran successfully. |
| Clean ZIP extraction — `npm install` | **ENVIRONMENT BLOCKED** | Fresh-copy install was attempted; it timed out because `registry.npmjs.org` cannot be resolved from the assembly sandbox. No `node_modules` were created. |
| Clean ZIP extraction — Vite/Vitest/Playwright | **ENVIRONMENT BLOCKED** | These gates depend on the blocked npm install and therefore could not be executed from the fresh copy. |

## Implementation defects corrected during release verification

Release verification found and corrected source-level implementation issues without changing approved product behavior:

- repaired malformed TypeScript/TSX in the runtime repository, Detail view model, and App presentation;
- kept representative-member navigation/selection in typed exemplar Context Locators instead of silently promoting exemplar children to canonical member identity;
- made typed Cross-Connections keyboard-focusable, selectable, inspectable, and deliberately followable;
- added current Scenario state to Detail and non-color-only Scenario emphasis to Explore targets;
- separated direct Explore/Concepts view switching from semantic Return;
- fixed Concept validator test resolution so the one canonical Organizational Content Inventory under `docs/` remains the taxonomy source rather than creating a duplicate copy.

The full canonical/runtime validator suite still passes after these corrections.

## External blocker

The supplied authoritative source set does not contain the candidate-comparison ratings artifact required to reproduce **Documentation Confidence ≥ 3** for detailed initial systems. Readiness tooling records this as unavailable rather than assigning unsupported scores.

## Environment caveat

The assembly sandbox has no outbound DNS/network path to the npm registry. Consequently the network-dependent JavaScript release gates could not be truthfully executed here. The repository contains the exact-version dependency manifest, test/build configuration, and Windows commands required to execute those gates on a network-enabled machine.

The same egress limitation prevented npm from expanding the included npm v3 lock snapshot with the complete transitive dependency graph. The direct dependencies are exact-version pinned; run `npm install` on the first network-enabled clean installation. Preserve the resulting completed `package-lock.json`, then use `npm ci` thereafter.
