#!/usr/bin/env node

const path = require('path');
const TaskMasterGitIntegration = require('./git-integration');

class TaskMasterWrapper {
  constructor() {
    this.integration = new TaskMasterGitIntegration();
  }

  async handleCommand(args) {
    const [command, ...params] = args;

    // Handle set-task-status command with Git automation
    if (command === 'set-task-status') {
      const taskId = params[0];
      const newStatus = params[1];

      if (!taskId || !newStatus) {
        console.error(
          '❌ Usage: npm run tm set-task-status <taskId> <newStatus>'
        );
        process.exit(1);
      }

      console.log(
        `🔄 Processing task ${taskId} status change to "${newStatus}"...`
      );

      // Since MCP tools handle the actual TaskMaster operations,
      // we just trigger the Git automation here
      console.log(
        '💡 Use MCP TaskMaster tools in your editor for the actual status change'
      );
      console.log(`   Then this automation will handle the Git operations:`);

      try {
        // Trigger Git automation for the status change
        this.integration.handleStatusChange(
          taskId,
          newStatus,
          `task-${taskId}`
        );
        console.log(`✅ Git automation completed for task ${taskId}`);
      } catch (error) {
        console.error(`❌ Git automation failed:`, error.message);
        process.exit(1);
      }
    }
    // For other commands, provide guidance
    else {
      console.log(`
🔧 TaskMaster Git Integration Wrapper

For task operations, use the MCP TaskMaster tools in your editor, then run:
  npm run tm set-task-status <id> <status>  # To trigger Git automation

Available commands:
  npm run tm set-task-status 1 in-progress  # Trigger Git automation for task
  npm run tm git-status                     # Show current Git status
  npm run tm help                           # Show this help

💡 For full TaskMaster functionality, use the MCP tools in your editor:
   - mcp_taskmaster-ai_get_tasks
   - mcp_taskmaster-ai_set_task_status
   - mcp_taskmaster-ai_get_task
   - etc.

The automation system will handle Git operations when you change task status.
      `);
    }
  }
}

// CLI interface
if (require.main === module) {
  const wrapper = new TaskMasterWrapper();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🔧 TaskMaster Git Integration Wrapper

This wrapper adds Git automation to TaskMaster operations.

Usage: npm run tm <command> [args]

Examples:
  npm run tm set-task-status 1 in-progress  # Trigger Git automation
  npm run tm set-task-status 1 done         # Complete with Git automation
  npm run tm help                           # Show detailed help

💡 For task management, use MCP TaskMaster tools in your editor.
   This wrapper handles the Git automation part.

Automation Features:
  ✅ Auto-creates Git branches for in-progress tasks
  ✅ Auto-commits progress on status changes
  ✅ Validates dependencies before completion
  ✅ Suggests PR creation on task completion
    `);
    process.exit(0);
  }

  wrapper.handleCommand(args).catch(error => {
    console.error('❌ Wrapper failed:', error.message);
    process.exit(1);
  });
}

module.exports = TaskMasterWrapper;
