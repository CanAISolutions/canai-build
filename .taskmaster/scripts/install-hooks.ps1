# TaskMaster Git Integration Installation Script (Windows PowerShell)

Write-Host "🔧 Installing TaskMaster Git Integration..." -ForegroundColor Cyan

# Check if we're in a Git repository
if (Test-Path ".git") {
    Write-Host "📁 Setting up Git hooks..." -ForegroundColor Yellow

    # Create hooks directory if it doesn't exist
    if (!(Test-Path ".git/hooks")) {
        New-Item -ItemType Directory -Path ".git/hooks" -Force | Out-Null
    }

    # Copy pre-commit hook
    Copy-Item ".githooks/pre-commit" ".git/hooks/pre-commit" -Force

    Write-Host "✅ Git hooks installed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️ Not a Git repository, skipping Git hooks installation" -ForegroundColor Yellow
}

# Validate installation
if (Test-Path ".taskmaster/config/automation.json") {
    Write-Host "✅ Automation config found" -ForegroundColor Green
} else {
    Write-Host "❌ Automation config missing" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 TaskMaster Git Integration installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  npm run tm get-tasks              # List tasks"
Write-Host "  npm run tm set-task-status 1 in-progress  # Start task with Git automation"
Write-Host "  npm run tm set-task-status 1 done         # Complete task with Git automation"
Write-Host ""
Write-Host "The system will now automatically:" -ForegroundColor Yellow
Write-Host "  ✅ Create Git branches for in-progress tasks"
Write-Host "  ✅ Commit progress on status changes"
Write-Host "  ✅ Validate dependencies before completion"
Write-Host "  ✅ Suggest PR creation on task completion"

exit 0
