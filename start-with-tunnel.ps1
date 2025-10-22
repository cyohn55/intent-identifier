# Start Intent Identifier Server with Cloudflare Tunnel
# This script starts both the Node.js server and Cloudflare Tunnel

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  Intent Identifier - Starting with Cloudflare Tunnel" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PORT = 8888
$env:PORT = $PORT
$env:NODE_ENV = "production"

# Check if cloudflared exists (check both .exe and no extension)
$cloudflaredPath = $null
if (Test-Path ".\cloudflared.exe") {
    $cloudflaredPath = ".\cloudflared.exe"
} elseif (Test-Path ".\cloudflared") {
    $cloudflaredPath = ".\cloudflared"
} else {
    Write-Host "ERROR: cloudflared executable not found!" -ForegroundColor Red
    Write-Host "Please download from: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found cloudflared at: $cloudflaredPath" -ForegroundColor Green

# Start Node.js server in background
Write-Host "Starting Node.js server on port $PORT..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    param($port)
    $env:PORT = $port
    $env:NODE_ENV = "production"
    Set-Location $using:PWD
    Set-Location Frontend
    node server.js
} -ArgumentList $PORT

# Wait a moment for server to start
Start-Sleep -Seconds 3

# Check if server started
$serverState = Get-Job -Id $serverJob.Id | Select-Object -ExpandProperty State
if ($serverState -eq "Running") {
    Write-Host "Server started successfully!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Server may not have started properly" -ForegroundColor Yellow
    Write-Host "Job State: $serverState" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host "This will generate a new tunnel URL. Please wait..." -ForegroundColor Yellow
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  IMPORTANT: Copy the tunnel URL that appears below!" -ForegroundColor Green
Write-Host "  You will need to update config.js with this URL" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
Write-Host ""

# Start cloudflared tunnel (this will run in foreground and show output)
# Since cloudflared is a Linux binary, we need to run it through WSL
Write-Host "Running cloudflared through WSL..." -ForegroundColor Cyan
wsl ./cloudflared tunnel --url http://localhost:$PORT

# Cleanup when tunnel stops (Ctrl+C)
Write-Host ""
Write-Host "Stopping server..." -ForegroundColor Yellow
Stop-Job -Id $serverJob.Id
Remove-Job -Id $serverJob.Id
Write-Host "Server stopped." -ForegroundColor Green
