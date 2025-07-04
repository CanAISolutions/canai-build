# TaskMaster Git Workflow Quick Reference

This guide outlines the branch and commit message standards for the CanAI Emotional Sovereignty
Platform, ensuring traceability and alignment with TaskMaster and PRD-driven development.

## 1. Branch Naming Pattern

- **Format:**

  ```
  feature/task-{id}-{slug}
  ```

  - `{id}`: TaskMaster task ID (e.g., 2.5)
  - `{slug}`: Short, kebab-case description (e.g., rls-logging-business-tables)

- **Example:**
  ```
  feature/task-2.5-rls-logging-business-tables
  ```

## 2. Commit Message Pattern

- **Format:**

  ```
  TaskMaster: {action} task {id} - {title}
  ```

  - `{action}`: start, update, complete, fix, etc.
  - `{id}`: TaskMaster task ID
  - `{title}`: Task title from tasks.json

- **Example:**
  ```
  TaskMaster: complete task 2.5 - Implement Row Level Security policies for logging and business tables
  ```

## 3. Workflow Steps

1. **Start from main:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create a new branch:**
   ```bash
   git checkout -b feature/task-2.5-rls-logging-business-tables
   ```
3. **Commit as you work:**
   ```bash
   git add .
   git commit -m "TaskMaster: update task 2.5 - Add RLS for feedback_logs"
   ```
4. **Push your branch:**
   ```bash
   git push origin feature/task-2.5-rls-logging-business-tables
   ```
5. **Open a Pull Request:**
   - Title:
     `TaskMaster: complete task 2.5 - Implement Row Level Security policies for logging and business tables`
   - Reference the TaskMaster task and PRD section in the description.
6. **After merge:**
   ```bash
   git branch -d feature/task-2.5-rls-logging-business-tables
   git push origin --delete feature/task-2.5-rls-logging-business-tables
   ```

## 4. Tips

- Always keep branch and commit patterns consistent for traceability.
- Reference TaskMaster/PRD in PRs for context.
- Ask for review if unsure—collaboration is key!

---

**Keep this file updated as your workflow evolves. The AI agent will use this as a reference to
guide you and future contributors.**
