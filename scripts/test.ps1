# Runs every PAN AI quality gate: backend lint + tests, frontend lint + typecheck + tests + build.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Invoke-Step([string]$Name, [string]$Dir, [scriptblock]$Block) {
    Write-Host "==> $Name" -ForegroundColor Cyan
    Push-Location $Dir
    try {
        & $Block
        if ($LASTEXITCODE -ne 0) { throw "$Name failed" }
    } finally { Pop-Location }
}

Invoke-Step 'Backend lint'      "$root\backend"  { uv run ruff check . ; if ($LASTEXITCODE -eq 0) { uv run ruff format --check . } }
Invoke-Step 'Backend tests'     "$root\backend"  { uv run pytest }
Invoke-Step 'Frontend lint'     "$root\frontend" { pnpm lint }
Invoke-Step 'Frontend tests'    "$root\frontend" { pnpm test }
Invoke-Step 'Frontend build'    "$root\frontend" { pnpm build }

Write-Host 'All checks passed.' -ForegroundColor Green
