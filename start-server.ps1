# Intent Identifier - Windows PowerShell Startup Script
# This script starts both the Node.js server and ngrok tunnel on Windows

param(
    [switch]$ngrok,
    [switch]$dev,
    [int]$port = 3000
)

# Configuration
$PORT = if ($port) { $port } else { 3000 }

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Intent Identifier - Starting Services" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($ngrok) {
    # Check if ngrok exists
    if (-Not (Test-Path ".\ngrok.exe")) {
        Write-Host "✗ ngrok.exe not found" -ForegroundColor Red
        Write-Host "  Please download ngrok from https://ngrok.com/download" -ForegroundColor Yellow
        exit 1
    }

    # Kill any existing ngrok processes
    Write-Host "Checking for existing ngrok processes..." -ForegroundColor Yellow
    Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2

    # Start ngrok in the background
    Write-Host "Starting ngrok tunnel on port $PORT..." -ForegroundColor Yellow
    $ngrokJob = Start-Process -FilePath ".\ngrok.exe" -ArgumentList "http", $PORT, "--log=stdout" -RedirectStandardOutput "ngrok.log" -NoNewWindow -PassThru

    # Wait for ngrok to initialize
    Write-Host "Waiting for ngrok to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 4

    # Get the public URL
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
        $publicUrl = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1 -ExpandProperty public_url

        if ($publicUrl) {
            Write-Host "✓ ngrok tunnel active: $publicUrl" -ForegroundColor Green
            Write-Host ""
            Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
            Write-Host "  Public URL: $publicUrl" -ForegroundColor Green
            Write-Host "  ngrok Dashboard: http://localhost:4040" -ForegroundColor Green
            Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
            Write-Host ""
        } else {
            Write-Host "⚠ Could not retrieve ngrok URL. Check ngrok.log for details." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Could not connect to ngrok API. Check ngrok.log for details." -ForegroundColor Yellow
    }

    # Cleanup function
    $cleanup = {
        Write-Host ""
        Write-Host "Stopping ngrok..." -ForegroundColor Yellow
        Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
    }

    # Register cleanup on exit
    Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null
}

Write-Host "Starting Node.js server on port $PORT..." -ForegroundColor Yellow
Write-Host ""

# Set environment variables and start server
$env:PORT = $PORT

if ($dev) {
    $env:NODE_ENV = "development"
    # Try nodemon first, fall back to node
    if (Get-Command nodemon -ErrorAction SilentlyContinue) {
        Set-Location Frontend
        nodemon server.js
    } else {
        Set-Location Frontend
        node server.js
    }
} else {
    $env:NODE_ENV = "production"
    Set-Location Frontend
    node server.js
}

# Cleanup ngrok if it was started
if ($ngrok) {
    & $cleanup
}
