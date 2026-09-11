# Phase 6 study-image candidates

These images were rendered from the current Explore view-model and exact `src/app/explore` components using the dependency-light benchmark adapter plus **system Chromium**. They support review of the Phase-6 comprehension-study packet only.

They are **not** the authoritative Playwright visual-regression baselines required by the Phase-6 exit criteria. The authoritative baselines must be generated/approved after the pinned npm/Vite/Playwright environment is available. If pinned rendering differs materially, replace or reconfirm these study images before moderated comprehension testing.

Included scenes:

- `h100-checkpoint.png` — H100 Representative compute node under checkpoint/storage pressure;
- `gb300-storage-pressure.png` — GB300 rack under North/South / storage pressure;
- `meta-checkpoint.png` — Meta root under checkpoint/storage burst, illustrating the accepted distinction between the physical RoCE fabric and the separately modeled logical compute-to-storage path.
