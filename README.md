# Systems for Modern AI — Version 1

Interactive browser-first educational explorer for the physical architecture, networking, hardware, and infrastructure used in modern AI systems.

This repository is the current Version 1 implementation snapshot. It contains the canonical project documentation and authored content, validation/compiler tooling, generated runtime artifacts, browser application source, tests, and release configuration. Installed dependencies and machine-specific build artifacts are intentionally excluded.

## Version 1 scope

The user-facing application exposes exactly these five Reference Systems:

1. NVIDIA DGX H100 SuperPOD — default
2. NVIDIA DGX GB300 NVL72 / SuperPOD
3. Google Cloud TPU7x (Ironwood) Pod / Superpod
4. Cerebras CS-3 / Condor Galaxy 3
5. Meta 24K H100 RoCE Training Cluster

The broader RSC corpus remains in `content/RSCs/` for validation and future development but is not promoted into the initial user experience.

## Prerequisites — Windows PowerShell

Use a 64-bit Windows 10/11 environment with:

- **PowerShell 7.4+** recommended (`pwsh`), Windows PowerShell 5.1 also works for the commands below.
- **Node.js 22.12.0 or newer** with npm 10+.
- **Python 3.11–3.13** with the Windows `py` launcher.
- Internet access during the first JavaScript dependency installation and Playwright browser installation.

Verify:

```powershell
node --version
npm --version
py --version
```

## Clean installation

From the extracted repository root:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
npm ci
npm run test:e2e:install
```

`package.json` pins every direct JavaScript dependency to an exact version, and the included npm v3 `package-lock.json` contains the resolved transitive dependency graph for reproducible clean installs. Use `npm ci` for normal clean installation/CI; network access or a populated npm cache is still required to fetch packages that are not already available locally.

## Runtime-content generation

```powershell
.\.venv\Scripts\Activate.ps1
npm run content:generate
```

This compiles canonical YAML/Markdown into deterministic generated JSON under `runtime/generated/` and mirrors browser-consumable runtime data to `public/runtime/`.

## Validation

```powershell
.\.venv\Scripts\Activate.ps1
npm run content:validate
```

This runs the RSC validators, Concept validators/tests, initial-five migration checks, deterministic-runtime check, runtime referential-integrity checks, property conformance fixtures, and content/readiness audit.

## Development launch

```powershell
.\.venv\Scripts\Activate.ps1
npm run content:generate
npm run dev
```

Open the Vite URL printed in the console (normally `http://localhost:5173`).

## TypeScript checks

```powershell
npm run typecheck
```

## Unit testing

```powershell
npm test
```

For watch mode:

```powershell
npm run test:watch
```

## Playwright testing

Install browser binaries once per machine:

```powershell
npm run test:e2e:install
```

Run Chromium, Firefox, and WebKit:

```powershell
npm run build
npm run test:e2e
```

Playwright starts the production preview server automatically.

## Production build

```powershell
.\.venv\Scripts\Activate.ps1
npm run build
```

The static production output is written to `dist/`.

## Production preview

```powershell
npm run preview -- --host 127.0.0.1
```

Open `http://127.0.0.1:4173` unless Vite reports a different port.

## Full local verification

After installation and Playwright browser setup:

```powershell
.\.venv\Scripts\Activate.ps1
npm run verify
```

Or run the PowerShell helper:

```powershell
.\scripts\release\verify.ps1
```

## Repository structure

```text
.
├── docs/                         Authoritative project documentation and implementation notes
├── content/
│   ├── RSCs/                     Canonical Reference-System YAML, schemas, validator, templates
│   ├── concepts/                 Canonical Concept YAML/Markdown, schema, tests, migration guidance
│   ├── products/                 Canonical reusable Product Definitions and schema
│   └── capabilities/             Language-neutral entity capability registry
├── scenarios/                    Configuration-local Version-1 Scenario catalogs
├── property/                     Global Property Registry and schema
├── runtime/generated/            Generated language-neutral runtime artifacts
├── public/runtime/               Generated browser runtime mirror
├── readiness/                    Initial-five readiness declarations
├── reports/                      Baseline, migration, benchmark, readiness, and release evidence
├── scripts/content/              Validation and deterministic content compiler tooling
├── scripts/release/              Handoff verification helpers
├── src/                          Platform-neutral domain/state/view models + React browser presentation
├── tests/unit/                   Vitest semantic/runtime tests
├── tests/e2e/                    Playwright browser tests
├── package.json                  Exact direct JavaScript dependency versions
├── package-lock.json             Included npm lock snapshot; see caveat below
├── requirements.txt              Exact Python tool dependencies
└── .github/workflows/            CI and optional Pages deployment workflows
```

## Canonical-source rules

Canonical authoring remains YAML/Markdown plus the documented schemas. `runtime/generated/`, `public/runtime/`, reports, and build output are derivative artifacts. Do not hand-edit generated runtime JSON as a substitute for canonical source changes.

Product semantics are governed by `docs/Systems_for_Modern_AI_Project_Source_of_Truth.md`. Implementation-specific decisions are governed by `docs/Delivery_Rendering_and_Platform_Implementation_Plan.md`. `docs/Organizational_Content_Inventory.md` is the canonical inventory taxonomy, not a behavior engine.

## npm lockfile and clean-install note

The current repository includes a populated npm v3 `package-lock.json` with the resolved transitive dependency graph for the exact direct dependency versions in `package.json`. Use **`npm ci`** for reproducible clean installs and CI. A clean install still requires npm-registry access (or an appropriately populated local cache); the offline review environment used for some repository verification could not fetch packages and therefore could not rerun dependency-backed TypeScript/Vitest/Vite/Playwright gates.

This is an environment-specific verification limitation, not a change to the approved application stack.

## Remaining release-evidence gaps

The supplied authoritative shared-source set does not contain the candidate-comparison artifact needed to reproduce the Source-of-Truth requirement that detailed initial systems have **Documentation Confidence ≥ 3**. Content/readiness tooling records this explicitly rather than inventing a score. The current repository also records cross-browser Playwright verification as pending in an environment with installed npm dependencies and browser binaries.

See `docs/RELEASE_REPORT.md` for the current gate record.
