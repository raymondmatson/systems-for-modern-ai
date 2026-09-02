$ErrorActionPreference = "Stop"

if (-not (Test-Path ".venv")) {
    py -m venv .venv
}

& ".venv\Scripts\python.exe" -m pip install --upgrade pip
& ".venv\Scripts\python.exe" -m pip install -r requirements.txt
npm install
npm run test:e2e:install
& ".venv\Scripts\python.exe" scripts/content/build_runtime.py
& ".venv\Scripts\python.exe" scripts/content/validate_all.py

Write-Host "Bootstrap complete. Run npm run dev to start development."
