# Gemini CLI Guide

This document provides a project-specific guide for using the Gemini CLI to manage, audit, and track
progress for the CanAI Emotional Sovereignty Platform. It outlines how to leverage the CLI for code
audits, align implementations with project requirements, and monitor task progress. The guide is
tailored to this repository, referencing real files and workflows.

**Last Updated**: June 30, 2025

## Table of Contents

1. [Purpose](#purpose)
2. [Gemini CLI Overview](#gemini-cli-overview)
3. [Project Requirements Document (PRD) Management](#project-requirements-document-prd-management)
   - [Understanding the PRD](#understanding-the-prd)
   - [Key Requirements](#key-requirements)
4. [Task Progress Tracking](#task-progress-tracking)
   - [Task Status Overview](#task-status-overview)
   - [Auditing Tasks with Gemini CLI](#auditing-tasks-with-gemini-cli)
5. [Best Practices for Gemini CLI](#best-practices-for-gemini-cli)
6. [Next Steps](#next-steps)

## Purpose

The `GEMINI.md` file serves as a reusable guide for developers and teams using the Gemini CLI to:

- **Audit Code**: Verify that code implementations align with [tasks/tasks.json](tasks/tasks.json)
  directives and [docs/PRD.md](docs/PRD.md) requirements.
- **Track Progress**: Monitor task completion status to identify gaps and ensure readiness for
  upcoming milestones (F1-F9 journey).
- **Understand Requirements**: Summarize the structure and key requirements of the PRD to guide
  development.
- **Ensure Confidence**: Highlight potential issues or incomplete implementations to prevent
  failures in future development phases.

This file is intended for solo developers, teams, and future QA/support staff, ensuring reproducible
actions and alignment with project goals.

## Gemini CLI Overview

The Gemini CLI is a powerful tool for static code analysis, task auditing, and documentation review.
It supports commands to:

- Audit codebases against [tasks/tasks.json](tasks/tasks.json) and [docs/PRD.md](docs/PRD.md).
- Generate detailed reports on code quality, task completion, and compliance with specifications.
- Exclude sensitive files (e.g., `.env`) and include substitutes (e.g., [env.example](env.example)).

### Common Commands

- **`gemini audit`**: Performs static code analysis to verify task completion and alignment with
  requirements.
  ```bash
  gemini audit \
    --project-root . \
    --include tasks/tasks.json docs/PRD.md env.example \
    --exclude .env \
    --output audit-report.md \
    --instructions "Perform a static code audit of all tasks from tasks/tasks.json to verify completion against directives and requirements in docs/PRD.md. Review referenced files (see docs/project-structure-mapping.md) and their outputs. Use env.example for environment variables. For each task:
  ```

1. Confirm task inputs, outputs, and dependencies are implemented.
2. Verify alignment with PRD requirements (especially F1-F9 journey, analytics, Sentry, Supabase,
   emotional analysis).
3. Analyze files for correctness and completeness.
4. Identify potential issues (e.g., missing error handling, unhandled edge cases, analytics gaps).
5. Confirm environment variables are properly referenced.

Generate a report in audit-report.md with per-task status, files reviewed, PRD alignment, issues,
and recommendations."

````
- **`gemini validate`**: Checks configuration files or schemas for correctness.
- **`gemini report`**: Generates progress reports based on task status.

Refer to the Gemini CLI documentation for additional commands and options.

## Project Requirements Document (PRD) Management

### Understanding the PRD
The PRD is located at [docs/PRD.md](docs/PRD.md) and defines the project's scope, features, and technical requirements. Key sections include:
- **Introduction**: Purpose, value proposition, stakeholders, and assumptions.
- **User Journey (F1-F9)**: Key user interactions and associated APIs/services.
- **Functional Requirements**: UI behavior, integrations (Supabase, Sentry, analytics), and API specifications.
- **Non-Functional Requirements**: Performance, security, scalability, and accessibility targets.
- **Architecture**: Frontend, backend, database, and integration details.
- **Error Handling**: Strategies for retries, caching, and logging.
- **Testing Strategy**: Unit, integration, and load testing plans.
- **Security Strategy**: Data protection, compliance, and access controls.
- **Deployment Strategy**: Hosting, scaling, and rollback mechanisms.

Review the PRD to identify sections relevant to your tasks (e.g., API endpoints, analytics, emotional scoring, F1-F9 journey).

### Key Requirements
When using the Gemini CLI, focus on verifying:
- **Functionality**: APIs, services, and UI components match PRD specifications.
- **Performance**: Response times, uptime, and resource usage meet targets.
- **Security**: Access controls, input sanitization, and compliance (e.g., GDPR, WCAG).
- **Integrations**: Third-party services (Supabase, analytics, Sentry) are correctly implemented.
- **Scalability**: Code and database structures support expected user loads.
- **Accessibility**: UI adheres to accessibility standards (e.g., WCAG 2.2 AA).
- **Analytics**: Event tracking, batching, privacy, and enrichment are implemented per [docs/analytics-implementation-log.md](docs/analytics-implementation-log.md).

Customize audit instructions to check these requirements based on your PRD's structure.

## Task Progress Tracking

### Task Status Overview
Tasks are defined in [tasks/tasks.json](tasks/tasks.json). Use the Gemini CLI to:
- Verify task completion against directives.
- Identify incomplete subtasks or dependencies.
- Summarize progress with metrics (e.g., completion rate, critical gaps).

To track progress:
1. Review [tasks/tasks.json](tasks/tasks.json) for task IDs, descriptions, inputs, outputs, and dependencies.
2. Use the Gemini CLI to audit specific tasks or generate a progress report.
3. Update documentation with findings to guide next steps (see [docs/project-structure-mapping.md](docs/project-structure-mapping.md) and [cortex.md](.cursor/rules/cortex.md)).

### Auditing Tasks with Gemini CLI
To audit tasks, craft a `gemini audit` command with tailored instructions. Example:

```bash
gemini audit \
--project-root . \
--include tasks/tasks.json docs/PRD.md env.example \
--exclude .env \
--task-ids <task-ids> \
--output audit-report.md \
--instructions "Perform a static code audit of tasks with IDs <task-ids> from tasks/tasks.json to verify completion against directives and requirements in docs/PRD.md. Review referenced files (see docs/project-structure-mapping.md) and their outputs. Use env.example for environment variables. For each task:

1. Confirm task inputs, outputs, and dependencies are implemented.
2. Verify alignment with PRD requirements (F1-F9 journey, analytics, Sentry, Supabase, emotional analysis).
3. Analyze files for correctness and completeness.
4. Identify potential issues (e.g., missing error handling, analytics gaps, unhandled edge cases).
5. Confirm environment variables are properly referenced.

Generate a report in audit-report.md with per-task status, files reviewed, PRD alignment, issues, and recommendations."
````

#### Expected Output

The audit command generates a report (e.g., `audit-report.md`) with:

- **Per-Task Sections**: Status (Completed, Partially Completed, Not Completed), files reviewed, PRD
  alignment, issues, and recommendations.
- **Summary Table**: Task IDs, titles, status, and critical findings.
- **Recommendations**: Steps to resolve issues before proceeding.

#### Usage Notes

- Run commands in the project root for correct path resolution.
- Ensure [env.example](env.example) includes all required variables (e.g., API keys, database URLs).
- Review the report promptly to address gaps.
- After audits, update [docs/project-structure-mapping.md](docs/project-structure-mapping.md) and
  [cortex.md](.cursor/rules/cortex.md) with verified, tested results and cross-references to
  TaskMaster task IDs.

## Best Practices for Gemini CLI

- **Use a Clean Environment**: Run commands in a fresh clone to avoid local changes affecting
  results.
- **Verify File Paths**: Confirm [tasks/tasks.json](tasks/tasks.json), [docs/PRD.md](docs/PRD.md),
  and [env.example](env.example) are accessible.
- **Tailor Instructions**: Write specific `--instructions` to focus on relevant files or
  requirements (e.g., analytics, Sentry, Supabase).
- **Review Outputs**: Check generated reports for actionable insights and address issues promptly.
- **Iterate Commands**: Refine audit prompts based on initial findings to target specific gaps.
- **Document Findings**: Update this file,
  [docs/project-structure-mapping.md](docs/project-structure-mapping.md), and
  [cortex.md](.cursor/rules/cortex.md) with audit results and next steps.
- **Integrate with TaskMaster**: Use audit results to inform TaskMaster task status and planning.
  See [README-git-workflow.md](README-git-workflow.md) for version control and workflow standards.

## Next Steps

1. **Configure Project Details**: Ensure [tasks/tasks.json](tasks/tasks.json),
   [docs/PRD.md](docs/PRD.md), and [env.example](env.example) are up to date and reflect current
   project state.
2. **Run Initial Audit**: Execute a `gemini audit` command to baseline task completion and PRD
   alignment.
3. **Address Gaps**: Resolve issues identified in the audit report (e.g., incomplete
   implementations, missing error handling, analytics gaps).
4. **Plan Next Milestones**: Use task progress data to prioritize upcoming tasks and dependencies
   (F1-F9 journey).
5. **Update Documentation**: Record audit findings and progress in this file,
   [docs/project-structure-mapping.md](docs/project-structure-mapping.md), and
   [cortex.md](.cursor/rules/cortex.md) to maintain a clear project history and verified progress
   chain.
