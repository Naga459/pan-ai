# One-time setup: install dependencies and create local .env files from the examples.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

& "$PSScriptRoot\check-prereqs.ps1"
if ($LASTEXITCODE -ne 0) { throw 'Install the missing required prerequisites first.' }

foreach ($dir in @($root, "$root\backend", "$root\frontend")) {
    if (-not (Test-Path "$dir\.env") -and (Test-Path "$dir\.env.example")) {
        Copy-Item "$dir\.env.example" "$dir\.env"
        Write-Host "Created $dir\.env"
    }
}

Push-Location "$root\backend"
try { uv sync; if ($LASTEXITCODE -ne 0) { throw 'uv sync failed' } } finally { Pop-Location }

Push-Location "$root\frontend"
try { pnpm install; if ($LASTEXITCODE -ne 0) { throw 'pnpm install failed' } } finally { Pop-Location }

Write-Host 'Setup complete. Run scripts\dev.ps1 to start PAN AI.' -ForegroundColor Green
