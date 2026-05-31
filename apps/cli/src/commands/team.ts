import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { TeamManager } from '@sukit/modules-core';

export async function teamCommand(action?: string): Promise<void> {
  const projectPath = process.cwd();
  const teamManager = new TeamManager(projectPath);

  if (!action) {
    console.log(chalk.yellow('\nUsage: sukit team <init|add|remove|list|sync>\n'));
    return;
  }

  try {
    switch (action) {
      case 'init': {
        const answers = await inquirer.prompt([
          { type: 'input', name: 'teamName', message: 'Team name:' },
          { type: 'input', name: 'teamSlug', message: 'Team slug:' },
          {
            type: 'list',
            name: 'plan',
            message: 'Plan:',
            choices: [
              { name: 'Free', value: 'Free' },
              { name: 'Pro ($29/month)', value: 'Pro ($29/month)' },
              { name: 'Enterprise', value: 'Enterprise' },
            ],
          },
        ]);
        const spinner = ora('Initializing team...').start();
        const team = await teamManager.initTeam(answers);
        spinner.succeed(chalk.green(`Team "${team.name}" created`));
        break;
      }

      case 'add': {
        const answers = await inquirer.prompt([
          { type: 'input', name: 'email', message: 'Member email:' },
          {
            type: 'list',
            name: 'role',
            message: 'Role:',
            choices: [
              { name: 'Admin', value: 'admin' },
              { name: 'Member', value: 'member' },
              { name: 'Viewer', value: 'viewer' },
            ],
          },
        ]);
        const spinner = ora('Adding member...').start();
        const member = await teamManager.addMember(answers.email, answers.role);
        spinner.succeed(chalk.green(`${member.email} added as ${member.role}`));
        break;
      }

      case 'remove': {
        const members = await teamManager.listMembers();
        if (members.length === 0) {
          console.log(chalk.yellow('No members to remove.'));
          return;
        }
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'userId',
            message: 'Select member to remove:',
            choices: members.map(m => ({ name: `${m.email} (${m.role})`, value: m.id })),
          },
        ]);
        const spinner = ora('Removing member...').start();
        await teamManager.removeMember(answers.userId);
        spinner.succeed('Member removed');
        break;
      }

      case 'list': {
        const team = await teamManager.getCurrentTeam();
        const members = await teamManager.listMembers();
        console.log(chalk.bold(`\n  Team: ${team.name} (${team.plan})`));
        console.log(`  Members (${members.length}):\n`);
        for (const member of members) {
          console.log(`  ${chalk.cyan(member.email)} ${chalk.gray(member.role)}`);
        }
        console.log();
        break;
      }

      default:
        console.log(chalk.red(`Unknown action: ${action}. Use: init, add, remove, list`));
    }
  } catch (error: any) {
    throw error;
  }
}
