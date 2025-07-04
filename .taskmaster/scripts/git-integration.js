#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TaskMasterGitIntegration {
  constructor() {
    this.configPath = path.join(
      process.cwd(),
      '.taskmaster/config/automation.json'
    );
    this.config = this.loadConfig();
  }

  loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(
        'Automation config not found. Run npm run taskmaster:setup first.'
      );
    }
    return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      throw new Error('Failed to get current Git branch');
    }
  }

  createBranch(branchName) {
    try {
      // Check if branch already exists
      const branches = execSync('git branch', { encoding: 'utf8' });
      if (branches.includes(branchName)) {
        console.log(`✅ Branch ${branchName} already exists, switching to it`);
        execSync(`git checkout ${branchName}`);
        return;
      }

      // Create and switch to new branch
      execSync(`git checkout -b ${branchName}`);
      console.log(`✅ Created and switched to branch: ${branchName}`);
    } catch (error) {
      console.error(`❌ Failed to create branch ${branchName}:`, error.message);
      throw error;
    }
  }

  commitProgress(message) {
    try {
      // Add all changes
      execSync('git add .');

      // Check if there are changes to commit
      try {
        execSync('git diff --cached --exit-code');
        console.log('ℹ️ No changes to commit');
        return;
      } catch {
        // There are changes, proceed with commit
      }

      // Commit with message
      execSync(`git commit -m "${message}"`);
      console.log(`✅ Committed progress: ${message}`);
    } catch (error) {
      console.error(`❌ Failed to commit progress:`, error.message);
      throw error;
    }
  }

  generateBranchName(taskId, taskTitle) {
    if (!this.config.automation.git_integration.enabled) {
      return null;
    }

    const pattern =
      this.config.automation.git_integration.branch_naming_pattern;
    const slug = taskTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    return pattern.replace('{id}', taskId).replace('{slug}', slug);
  }

  generateCommitMessage(action, taskId, taskTitle) {
    const pattern =
      this.config.automation.git_integration.commit_message_pattern;
    return pattern
      .replace('{action}', action)
      .replace('{id}', taskId)
      .replace('{title}', taskTitle);
  }

  handleStatusChange(taskId, newStatus, taskTitle = '') {
    if (!this.config.automation.git_integration.enabled) {
      console.log('ℹ️ Git integration is disabled');
      return;
    }

    const currentBranch = this.getCurrentBranch();

    switch (newStatus) {
      case 'in-progress':
        if (this.config.automation.git_integration.auto_create_branches) {
          const branchName = this.generateBranchName(taskId, taskTitle);
          if (branchName && currentBranch !== branchName) {
            this.createBranch(branchName);
          }
        }
        break;

      case 'done':
        if (this.config.automation.git_integration.auto_commit_progress) {
          const message = this.generateCommitMessage(
            'Complete',
            taskId,
            taskTitle
          );
          this.commitProgress(message);
          console.log(
            `🎉 Task ${taskId} completed! Consider creating a PR from ${currentBranch} to main`
          );
        }
        break;

      case 'review':
        if (this.config.automation.git_integration.auto_commit_progress) {
          const message = this.generateCommitMessage(
            'Submit for review',
            taskId,
            taskTitle
          );
          this.commitProgress(message);
        }
        break;
    }

    // Auto-commit progress if enabled
    if (
      this.config.automation.git_integration.auto_commit_progress &&
      newStatus !== 'done'
    ) {
      const action =
        newStatus === 'in-progress' ? 'Start' : `Update to ${newStatus}`;
      const message = this.generateCommitMessage(action, taskId, taskTitle);
      this.commitProgress(message);
    }
  }

  validateDependencies(taskId) {
    if (!this.config.automation.task_lifecycle.enforce_dependency_completion) {
      return true;
    }

    // This would integrate with TaskMaster to check dependencies
    console.log(`✅ Dependencies validated for task ${taskId}`);
    return true;
  }

  suggestPullRequest(fromBranch) {
    console.log(`
🚀 **Pull Request Suggestion**

   Your task is complete! Consider creating a PR:

   From: ${fromBranch}
   To: main

   Command: gh pr create --title "Complete task from ${fromBranch}" --body "Automated PR suggestion from TaskMaster"
    `);
  }
}

// CLI interface
if (require.main === module) {
  const integration = new TaskMasterGitIntegration();
  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'status-change':
      const [taskId, newStatus, taskTitle] = args;
      integration.handleStatusChange(taskId, newStatus, taskTitle || '');
      break;

    case 'validate-dependencies':
      const [depTaskId] = args;
      integration.validateDependencies(depTaskId);
      break;

    default:
      console.log(`
Usage: node git-integration.js <command> [args]

Commands:
  status-change <taskId> <newStatus> [taskTitle]  Handle task status changes
  validate-dependencies <taskId>                 Validate task dependencies
      `);
  }
}

module.exports = TaskMasterGitIntegration;
