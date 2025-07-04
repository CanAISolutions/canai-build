#!/bin/bash

# TaskMaster Git Integration Installation Script (Unix/Mac)

set -e

echo "🔧 Installing TaskMaster Git Integration..."

# Make scripts executable
chmod +x .taskmaster/scripts/git-integration.js
chmod +x .taskmaster/scripts/taskmaster-wrapper.js
chmod +x .githooks/pre-commit

# Install Git hooks
if [ -d ".git" ]; then
  echo "📁 Setting up Git hooks..."

  # Create hooks directory if it doesn't exist
  mkdir -p .git/hooks

  # Copy pre-commit hook
  cp .githooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit

  echo "✅ Git hooks installed successfully"
else
  echo "⚠️ Not a Git repository, skipping Git hooks installation"
fi

# Validate installation
if [ -f ".taskmaster/config/automation.json" ]; then
  echo "✅ Automation config found"
else
  echo "❌ Automation config missing"
  exit 1
fi

echo "🎉 TaskMaster Git Integration installed successfully!"
echo ""
echo "Usage:"
echo "  npm run tm get-tasks              # List tasks"
echo "  npm run tm set-task-status 1 in-progress  # Start task with Git automation"
echo "  npm run tm set-task-status 1 done         # Complete task with Git automation"
echo ""
echo "The system will now automatically:"
echo "  ✅ Create Git branches for in-progress tasks"
echo "  ✅ Commit progress on status changes"
echo "  ✅ Validate dependencies before completion"
echo "  ✅ Suggest PR creation on task completion"

exit 0
