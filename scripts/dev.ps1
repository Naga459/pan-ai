# Starts PostgreSQL (Docker), applies migrations, then runs the API and web dev servers.
#   -NoDb   skip Docker/PostgreSQL (API still starts; /health/ready reports degraded)
param([switch]$NoDb)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

if (-not $NoDb) {
    Push-Location $root
    try {
        docker compose up -d --wait db
        if ($LASTEXITCODE -ne 0) { throw 'Could not start PostgreSQL. Is Docker running? Use -NoDb to skip.' }
    } finally { Pop-Location }

    Push-Location "$root\backend"
    try {
        uv run alembic upgrade head
        if ($LASTEXITCODE -ne 0) { throw 'Database migration failed.' }
    } finally { Pop-Location }
}

$api = Start-Process -PassThru -NoNewWindow -WorkingDirectory "$root\backend" -FilePath 'uv' `
    -ArgumentList 'run', 'uvicorn', 'app.main:app', '--reload', '--host', '127.0.0.1', '--port', '8760'
$web = Start-Process -PassThru -NoNewWindow -WorkingDirectory "$root\frontend" -FilePath 'pnpm' -ArgumentList 'dev'

Write-Host 'PAN AI web: http://127.0.0.1:5760   API docs: http://127.0.0.1:8760/docs' -ForegroundColor Green
Write-Host 'Press Ctrl+C to stop.'
try {
    Wait-Process -Id $api.Id, $web.Id
} finally {
    foreach ($p in @($api, $web)) {
        if (-not $p.HasExited) { & taskkill /PID $p.Id /T /F | Out-Null }
    }
}
