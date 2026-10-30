# Reports which PAN AI prerequisites are installed. Exits 1 if a required one is missing.
$ErrorActionPreference = 'Continue'

$checks = @(
    @{ Name = 'Node.js'; Cmd = 'node';   Args = @('--version');         Required = $true;  Hint = 'Install Node.js 22+ from https://nodejs.org' },
    @{ Name = 'pnpm';    Cmd = 'pnpm';   Args = @('--version');         Required = $true;  Hint = 'corepack enable; corepack prepare pnpm@latest --activate' },
    @{ Name = 'uv';      Cmd = 'uv';     Args = @('--version');         Required = $true;  Hint = 'powershell -c "irm https://astral.sh/uv/install.ps1 | iex"' },
    @{ Name = 'Python';  Cmd = 'python'; Args = @('--version');         Required = $false; Hint = 'uv manages Python 3.12 for the backend automatically' },
    @{ Name = 'Docker';  Cmd = 'docker'; Args = @('--version');         Required = $true;  Hint = 'Install Docker Desktop (needed for PostgreSQL + pgvector)' },
    @{ Name = 'Compose'; Cmd = 'docker'; Args = @('compose', 'version'); Required = $true;  Hint = 'Docker Compose v2 ships with Docker Desktop' },
    @{ Name = 'Ollama';  Cmd = 'ollama'; Args = @('--version');         Required = $false; Hint = 'Needed from PAN-005: https://ollama.com/download' }
)

$missingRequired = $false
foreach ($check in $checks) {
    $found = Get-Command $check.Cmd -ErrorAction SilentlyContinue
    $version = $null
    if ($found) {
        $version = (& $check.Cmd @($check.Args) 2>$null | Select-Object -First 1)
    }
    if ($version) {
        Write-Host ("[ OK ] {0,-8} {1}" -f $check.Name, $version) -ForegroundColor Green
    } elseif ($check.Required) {
        Write-Host ("[MISS] {0,-8} REQUIRED - {1}" -f $check.Name, $check.Hint) -ForegroundColor Red
        $missingRequired = $true
    } else {
        Write-Host ("[MISS] {0,-8} optional - {1}" -f $check.Name, $check.Hint) -ForegroundColor Yellow
    }
}

if ($missingRequired) { exit 1 }
