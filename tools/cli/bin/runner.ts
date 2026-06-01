import { CLI } from '../src/index';

const interactivePrompt = async (
  questions: any[]
): Promise<Record<string, any>> => {
  const answers: Record<string, any> = {};
  for (const q of questions) {
    let val: any;
    if (q.type === 'confirm') {
      val = q.default !== false;
    } else if (q.type === 'list') {
      const choices = q.choices.map((c: any) =>
        typeof c === 'string' ? c : `  ${c.value}  - ${c.name}`
      );
      val = q.choices[0]?.value || '';
    } else {
      val = q.default || '';
    }
    answers[q.name] = val;
  }
  return answers;
};

const cli = new CLI(null as any, null as any);

export default {
  async run(
    command: string,
    subcommand: string | null,
    args: string[],
    flags: any
  ) {
    try {
      let result;

      if (command === 'module' && subcommand) {
        switch (subcommand) {
          case 'add': {
            const prompts = flags.yes
              ? {}
              : await interactivePrompt(cli.getInstallModulePrompts());
            result = await cli.installModule(
              {
                moduleId: prompts.moduleId || args[0],
                version: prompts.version || args[1],
              },
              flags
            );
            break;
          }
          case 'remove':
            result = await cli.removeModule({ moduleId: args[0] }, flags);
            break;
          case 'list':
            result = await cli.listModules(flags);
            break;
          case 'update':
            result = await cli.updateModules(
              { moduleIds: args.length ? args : undefined },
              flags
            );
            break;
          case 'create': {
            const prompts = flags.yes
              ? {}
              : await interactivePrompt(cli.getScaffoldPrompts());
            result = await cli.scaffoldModule(
              {
                name: prompts.name || args[0],
                category: prompts.category || args[1],
              },
              flags
            );
            break;
          }
          case 'publish':
            result = await cli.publishModule(
              { moduleId: args[0], version: args[1] },
              flags
            );
            break;
          default:
            console.error(`Unknown module subcommand: ${subcommand}`);
            process.exit(1);
        }
      } else if (command === 'config' && subcommand) {
        switch (subcommand) {
          case 'get':
            result = await cli.configGet({ key: args[0] }, flags);
            break;
          case 'set':
            result = await cli.configSet(
              { key: args[0], value: args[1] },
              flags
            );
            break;
          case 'list':
            result = await cli.configList(flags);
            break;
          default:
            console.error(`Unknown config subcommand: ${subcommand}`);
            process.exit(1);
        }
      } else {
        switch (command) {
          case 'create': {
            const prompts = flags.yes
              ? {}
              : await interactivePrompt(
                  cli.getCreatePrompts({
                    name: args[0],
                    template: args[1],
                    dir: args[2],
                  })
                );
            result = await cli.create(
              {
                name: prompts.name || args[0],
                template: prompts.template || args[1],
                dir: args[2],
              },
              flags
            );
            break;
          }
          case 'build':
            result = await cli.build({ siteId: args[0] }, flags);
            break;
          case 'export': {
            const prompts = flags.yes
              ? {}
              : await interactivePrompt(cli.getExportPrompts());
            result = await cli.export(
              {
                siteId: prompts.siteId || args[0],
                format: prompts.format || args[1],
              },
              flags
            );
            break;
          }
          case 'deploy': {
            const prompts = flags.yes
              ? {}
              : await interactivePrompt(cli.getDeployPrompts());
            result = await cli.deploy(
              {
                siteId: prompts.siteId || args[0],
                provider: prompts.provider || args[1],
              },
              flags
            );
            break;
          }
          case 'dev':
            result = await cli.dev(
              {
                siteId: args[0],
                port: args[1] ? parseInt(args[1]) : undefined,
              },
              flags
            );
            break;
          case 'login':
            result = await cli.login(flags);
            break;
          case 'logout':
            result = await cli.logout(flags);
            break;
          case 'version':
            result = await cli.version(flags);
            break;
          case 'backup': {
            const prompts = flags.yes
              ? {}
              : await interactivePrompt(cli.getBackupPrompts());
            result = await cli.backup(
              {
                siteId: prompts.siteId || args[0],
                full: prompts.full || false,
              },
              flags
            );
            break;
          }
          case 'restore':
            result = await cli.restore({ backupId: args[0] }, flags);
            break;
          case 'migrate': {
            const prompts = flags.yes
              ? {}
              : await interactivePrompt(cli.getMigratePrompts());
            result = await cli.migrate(
              {
                platform: prompts.platform || args[0],
                filePath: prompts.filePath || args[1],
                siteId: prompts.siteId || args[2],
                dryRun: prompts.dryRun,
              },
              flags
            );
            break;
          }
          default:
            console.error(`Unknown command: ${command}`);
            process.exit(1);
        }
      }

      if (result) {
        if (result.message) console.log(result.message);
        if (flags.json || flags.verbose) {
          const output: any = {
            success: result.success,
            ...(result.data ? { data: result.data } : {}),
          };
          if (result.error) output.error = result.error;
          if (flags.json) console.log(JSON.stringify(output, null, 2));
          if (flags.verbose && result.data)
            console.log('\nResult data:', JSON.stringify(result.data, null, 2));
        }
        if (!result.success) process.exit(1);
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      if (flags.verbose) console.error(error.stack);
      process.exit(1);
    }
  },
};
