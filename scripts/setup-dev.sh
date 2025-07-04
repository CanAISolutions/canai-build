#!/bin/bash

# CanAI Platform Development Setup Script
# Based on Cursor Setup Guide Best Practices

set -e

echo "🚀 Setting up CanAI Platform development environment..."

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js version 18+ required. Current: $(node --version)"
        echo "💡 Use nvm: nvm install 20 && nvm use 20"
        exit 1
    fi
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Setup git hooks
echo "🔧 Setting up git hooks..."
npm run prepare

# Validate TypeScript configuration
echo "🔍 Validating TypeScript configuration..."
npm run typecheck

# Run initial linting
echo "🧹 Running initial linting..."
npm run lint:fix

# Format code
echo "💅 Formatting code..."
npm run format

# Validate setup
echo "✅ Running full validation..."
npm run validate:all

echo ""
echo "🎉 Setup complete! Your CanAI Platform development environment is ready."
echo ""
echo "📋 Next steps:"
echo "  1. Install Cursor extensions:"
echo "     - ESLint"
echo "     - Prettier"
echo "     - markdownlint"
echo "  2. Configure Cursor settings:"
echo "     - Enable 'Format on Save'"
echo "     - Enable 'ESLint: Auto Fix On Save'"
echo "  3. Review .cursor/ rules for AI assistance"
echo ""
echo "🔧 Useful commands:"
echo "  npm run dev              - Start development servers"
echo "  npm run validate:all     - Run all validations"
echo "  npm run canai:fix        - Fix common issues"
echo "  npm run test:watch       - Run tests in watch mode"
echo ""
