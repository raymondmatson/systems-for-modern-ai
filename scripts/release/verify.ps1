$ErrorActionPreference = "Stop"

Write-Host "== Systems for Modern AI: release verification =="

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    throw "Python virtual environment not found. Run: py -m venv .venv"
}

$python = ".venv\Scripts\python.exe"

Write-Host "[1/7] Generate runtime content"
& $python scripts/content/build_runtime.py

Write-Host "[2/7] Validate canonical/runtime content"
& $python scripts/content/validate_all.py

Write-Host "[3/7] TypeScript checks"
npm run typecheck

Write-Host "[4/7] Vitest"
npm test

Write-Host "[5/7] Vite production build"
npm run build

Write-Host "[6/7] Playwright browser availability"
npx playwright install --dry-run | Out-Host

Write-Host "[7/7] Playwright Chromium + Firefox + WebKit"
npm run test:e2e

Write-Host "Release verification completed successfully."
