# CanAI Local Build Testing Script (PowerShell)
# This script mirrors the Render deployment process for local testing

param(
    [string]$Port = "10000"
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting CanAI Local Build Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "render.yaml")) {
    Write-Error "render.yaml not found. Please run this script from the project root."
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from env.example..."
    Copy-Item "env.example" ".env"
    Write-Warning "Please edit .env with your actual values before continuing."
    Write-Warning "Press Enter when ready to continue..."
    Read-Host
}

# Step 1: Check Node.js version
Write-Status "Checking Node.js version..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js 18.19.0 or higher."
    exit 1
}

# Step 2: Install dependencies (mirrors Render buildCommand)
Write-Status "Installing dependencies..."
Set-Location backend
try {
    npm ci
    Write-Success "Dependencies installed successfully"
} catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Step 3: Build the project (mirrors Render buildCommand)
Write-Status "Building the project..."
try {
    npm run build
    Write-Success "Build completed successfully"
} catch {
    Write-Error "Build failed"
    exit 1
}

# Step 4: Run tests
Write-Status "Running tests..."
try {
    npm test
    Write-Success "Tests passed successfully"
} catch {
    Write-Error "Tests failed"
    exit 1
}

# Step 5: Check for TypeScript errors
Write-Status "Running TypeScript type check..."
try {
    npm run typecheck
    Write-Success "TypeScript type check passed"
} catch {
    Write-Error "TypeScript type check failed"
    exit 1
}

# Step 6: Start the server (mirrors Render startCommand)
Write-Status "Starting the server..."
Write-Warning "Server will start on port $Port (or PORT from .env)"
Write-Warning "Press Ctrl+C to stop the server"

# Set environment variables for local testing
$env:NODE_ENV = "production"
$env:PORT = $Port

# Start the server in the background
try {
    $serverJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm start
    }

    # Wait a moment for server to start
    Start-Sleep -Seconds 3

    # Step 7: Health check
    Write-Status "Performing health check..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/healthz" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Health check passed! Server is running on http://localhost:$Port"
        } else {
            Write-Error "Health check failed with status code: $($response.StatusCode)"
            Stop-Job $serverJob
            Remove-Job $serverJob
            exit 1
        }
    } catch {
        Write-Error "Health check failed! Server may not be running properly."
        Stop-Job $serverJob
        Remove-Job $serverJob
        exit 1
    }

    # Step 8: Test API endpoints
    Write-Status "Testing API endpoints..."

    # Test health endpoint
    try {
        $healthResponse = Invoke-WebRequest -Uri "http://localhost:$Port/healthz" -UseBasicParsing
        if ($healthResponse.Content -match "ok") {
            Write-Success "Health endpoint working"
        } else {
            Write-Warning "Health endpoint response unexpected"
        }
    } catch {
        Write-Warning "Could not test health endpoint"
    }

    # Test CORS headers
    try {
        $corsResponse = Invoke-WebRequest -Uri "http://localhost:$Port/healthz" -Method Head -UseBasicParsing
        if ($corsResponse.Headers["Access-Control-Allow-Origin"]) {
            Write-Success "CORS headers present"
        } else {
            Write-Warning "CORS headers not found"
        }
    } catch {
        Write-Warning "Could not test CORS headers"
    }

    # Step 9: Display server info
    Write-Host ""
    Write-Host "🎉 Local build test completed successfully!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Server is running on: http://localhost:$Port" -ForegroundColor White
    Write-Host "Health check: http://localhost:$Port/healthz" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop the server, press Ctrl+C" -ForegroundColor Yellow
    Write-Host "To view logs, check the job output" -ForegroundColor Yellow

    # Keep the script running and handle cleanup
    try {
        # Wait for user to stop the server
        Write-Host "Press any key to stop the server..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } finally {
        Write-Status "Stopping server..."
        Stop-Job $serverJob
        Remove-Job $serverJob
        Write-Success "Server stopped"
    }

} catch {
    Write-Error "Failed to start server: $($_.Exception.Message)"
    exit 1
} finally {
    # Return to original directory
    Set-Location ..
}