# CanAI Platform Project Mapping

## Overview

This document provides a 100% accurate, machine-readable mapping of the CANAI-BUILD monorepo project
structure. It is designed to be easily updated and serves as the single source of truth for the
project's layout.

**Version**: 4.0.0 **Last Updated**: 2025-07-15

---

## 📂 Root Structure

```
canai-build/
├── 📁 .github/                  # CI/CD workflows and templates (GitHub Actions)
├── 📁 .taskmaster/              # TaskMaster AI automation and task configuration
├── 📁 backend/                  # ✅ LIVE: Node.js/Express.js Backend API
├── 📁 frontend/                 # ⚛️ React/Vite Frontend Application
├── 📁 databases/                # Database schemas, migrations, and cron jobs
├── 📁 docs/                     # Project documentation (PRD, architecture, guides)
├── 📁 packages/                 # Shared libraries and utilities for the monorepo
├── 📁 scripts/                  # Automation and utility scripts
├── 📁 supabase/                 # Supabase-specific configurations and migrations
├── 📄 Dockerfile                # Main Docker configuration for deployment
├── 📄 docker-compose.yml        # Docker Compose for local development environment
├── 📄 GEMINI.md                 # Project-specific guide for the Gemini CLI
├── 📄 package.json              # Root project dependencies and scripts
├── 📄 README.md                 # Main project README
├── 📄 render.yaml               # Infrastructure-as-Code for Render deployment
├── 📄 tsconfig.json             # Root TypeScript configuration
└── 📄 vitest.config.ts          # Root Vitest testing configuration
```

---

## 📁 Key Directories

### 📁 `backend` - Backend API (Node.js/Express)

_Live at: https://canai-router.onrender.com_

```
backend/
├── 📁 api/                      # Core API source code (Express App)
│   ├── 📁 controllers/         # Request handlers and business logic
│   ├── 📁 middleware/         # Express middleware (auth, logging, error handling)
│   ├── 📁 routes/             # API route definitions
│   ├── 📁 services/           # Business logic services (PostHog, Stripe, etc.)
│   └── 📁 webhooks/           # Webhook handlers (e.g., for Make.com)
├── 📁 config/                   # Application configuration files
├── 📁 prompts/                  # GPT prompt templates and framework
├── 📁 supabase/                 # Supabase client and helper functions
├── 📁 tests/                    # Backend test suites (unit, integration)
├── 📄 db.ts                      # Direct PostgreSQL client for scripts/migrations
├── 📄 package.json               # Backend-specific npm dependencies
├── 📄 server.ts                  # Production Express server entry point
└── 📄 tsconfig.json             # Backend-specific TypeScript configuration
```

### 📁 `frontend` - Frontend Application (React/Vite)

```
frontend/
├── 📁 public/                   # Static assets (images, fonts, etc.)
├── 📁 src/                      # Frontend source code
│   ├── 📁 components/          # Reusable React components (UI, features)
│   ├── 📁 integrations/       # Client-side integrations (Supabase, Sentry)
│   ├── 📁 pages/              # Page components for the 9-stage user journey
│   ├── 📁 utils/              # Utility functions and helpers
│   └── 📄 main.tsx            # Main application entry point
├── 📄 index.html                 # Main HTML file
├── 📄 package.json               # Frontend-specific npm dependencies
├── 📄 tailwind.config.ts        # Tailwind CSS configuration
├── 📄 tsconfig.json             # Frontend-specific TypeScript configuration
└── 📄 vite.config.ts            # Vite build and development server configuration
```

### 📁 `docs` - Documentation

_Central repository for all project knowledge and specifications._

```
docs/
├── 📄 PRD.md                      # 🎯 Product Requirements Document (Authoritative Source)
├── 📄 api-contract-specification.md # API contract and endpoint definitions
├── 📄 technical-architecture-document-(TAD).md # System architecture overview
├── 📄 project-structure-mapping.md # (DEPRECATED) Old project structure file
├── 📄 supabase-schema-snapshot.sql # Snapshot of the Supabase DB schema
└── 📄 *.md                        # Other guides, logs, and specifications
```

### 📁 `supabase` - Supabase Configuration

_Contains database migrations and settings._

```
supabase/
└── 📁 migrations/               # SQL migration files for database schema changes
```

---

## ⚙️ Tooling & Configuration

- **CI/CD (`.github/`)**: Contains 17+ workflows for testing, linting, security scanning, and
  deployment.
- **Automation (`.taskmaster/`)**: Defines automated tasks, configurations, and scripts for
  development efficiency.
- **Containerization (`Dockerfile`, `docker-compose.yml`)**: Defines the environment for consistent
  local development and production deployment on Render.
- **Deployment (`render.yaml`)**: Specifies the services, databases, and environment for deploying
  the entire stack to Render.
