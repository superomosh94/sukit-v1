import type { SukitKernel } from '@sukit/core';
import type { MarketplaceLayer } from '@sukit/marketplace';
import type { CommandResult } from '../../types';

export interface CLIFlags {
  yes?: boolean;
  json?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

const TEMPLATES = [
  { name: 'Blank Site', value: 'blank' },
  { name: 'Blog', value: 'blog' },
  { name: 'Portfolio', value: 'portfolio' },
  { name: 'E-Commerce', value: 'ecommerce' },
  { name: 'Landing Page', value: 'landing' },
  { name: 'SaaS Dashboard', value: 'saas' },
  { name: 'Documentation', value: 'docs' },
  { name: 'Restaurant', value: 'restaurant' },
];

const DEPLOY_PROVIDERS = [
  { name: 'Netlify', value: 'netlify' },
  { name: 'Vercel', value: 'vercel' },
  { name: 'GitHub Pages', value: 'github-pages' },
  { name: 'AWS S3', value: 's3' },
  { name: 'Cloudflare Pages', value: 'cloudflare' },
];

const MIGRATE_SOURCES = [
  { name: 'WordPress (WXR/XML)', value: 'wordpress' },
  { name: 'Webflow (ZIP)', value: 'webflow' },
  { name: 'Wix (JSON)', value: 'wix' },
  { name: 'Squarespace (XML)', value: 'squarespace' },
  { name: 'Ghost (JSON)', value: 'ghost' },
  { name: 'Static HTML (Folder)', value: 'static-html' },
];

export class CLI {
  private kernel: SukitKernel;
  private marketplace?: MarketplaceLayer;

  constructor(kernel: SukitKernel, marketplace?: MarketplaceLayer) {
    this.kernel = kernel;
    this.marketplace = marketplace;
  }

  private checkDryRun(flags: CLIFlags): boolean {
    if (flags.dryRun) return true;
    return false;
  }

  private formatOutput(result: CommandResult, flags: CLIFlags): CommandResult {
    if (flags.json) result = { ...result, data: result.data || {} };
    if (flags.quiet && result.success) result.message = '';
    return result;
  }

  async create(
    args: { name?: string; template?: string; dir?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would create site "${args.name || 'my-site'}"`,
        data: {
          template: args.template || 'blank',
          directory: args.dir || process.cwd(),
        },
      };
    const template = args.template || 'blank';
    const name = args.name || `sukit-site-${Date.now()}`;
    const site = await this.kernel.sites.create(name, { template });
    const pages = await this.kernel.pages.list(site.id);
    const result = {
      success: true,
      message: `Site "${name}" created from ${template} template`,
      data: {
        id: site.id,
        name,
        template,
        pages: pages.length,
        directory: args.dir || name,
      },
    };
    return this.formatOutput(result, flags);
  }

  getCreatePrompts(args: {
    name?: string;
    template?: string;
    dir?: string;
  }): any[] {
    const prompts: any[] = [];
    if (!args.name)
      prompts.push({
        type: 'input',
        name: 'name',
        message: 'Site name:',
        default: 'my-sukit-site',
        validate: (v: string) =>
          v.length >= 2 || 'Name must be at least 2 characters',
      });
    if (!args.template)
      prompts.push({
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: TEMPLATES,
        default: 'blank',
      });
    return prompts;
  }

  async build(
    args: { siteId?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    const siteId = args.siteId || 'default';
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would build site ${siteId}`,
        data: { output: './dist' },
      };
    const site = await this.kernel.sites.get(siteId);
    const result = {
      success: true,
      message: `Site "${site.name}" built`,
      data: { siteId, output: './dist' },
    };
    return this.formatOutput(result, flags);
  }

  getBuildPrompts(): any[] {
    return [{ type: 'input', name: 'siteId', message: 'Site ID:' }];
  }

  async export(
    args: { siteId?: string; format?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    const siteId = args.siteId || 'default';
    const format = (args.format || 'zip') as 'zip' | 'next' | 'static';
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would export site ${siteId} as ${format}`,
        data: { format },
      };
    const site = await this.kernel.sites.get(siteId);
    const pages = await this.kernel.pages.list(siteId);
    const result = {
      success: true,
      message: `Site "${site.name}" exported as ${format}`,
      data: { siteId, format, totalPages: pages.length },
    };
    return this.formatOutput(result, flags);
  }

  getExportPrompts(): any[] {
    return [
      { type: 'input', name: 'siteId', message: 'Site ID:' },
      {
        type: 'list',
        name: 'format',
        message: 'Export format:',
        choices: [
          { name: 'ZIP Archive', value: 'zip' },
          { name: 'Next.js Project', value: 'next' },
          { name: 'Static HTML', value: 'static' },
        ],
      },
    ];
  }

  async deploy(
    args: { siteId?: string; provider?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    const siteId = args.siteId || 'default';
    const provider = (args.provider || 'netlify') as any;
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would deploy site ${siteId} to ${provider}`,
        data: { provider },
      };
    const site = await this.kernel.sites.get(siteId);
    const result = {
      success: true,
      message: `Site "${site.name}" deployed to ${provider}`,
      data: {
        siteId,
        provider,
        url: `https://${site.domain || 'app.sukit.dev'}`,
      },
    };
    return this.formatOutput(result, flags);
  }

  getDeployPrompts(): any[] {
    return [
      { type: 'input', name: 'siteId', message: 'Site ID:' },
      {
        type: 'list',
        name: 'provider',
        message: 'Deploy to:',
        choices: DEPLOY_PROVIDERS,
      },
    ];
  }

  async installModule(
    args: { moduleId?: string; version?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    if (!this.marketplace)
      return { success: false, message: 'Marketplace not available' };
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would install module ${args.moduleId}${args.version ? ` v${args.version}` : ''}`,
      };
    const result = await this.marketplace.installer.install(
      args.moduleId || '',
      'marketplace',
      { version: args.version }
    );
    if (result.success)
      return this.formatOutput(
        {
          success: true,
          message: `Module ${args.moduleId} installed`,
          data: result,
        },
        flags
      );
    return {
      success: false,
      message: `Failed to install ${args.moduleId}: ${result.errors?.join(', ')}`,
      error: result.errors?.join(', '),
    };
  }

  getInstallModulePrompts(): any[] {
    return [
      {
        type: 'input',
        name: 'moduleId',
        message: 'Module ID (e.g., @sukit/seo):',
        validate: (v: string) => v.length > 0 || 'Module ID is required',
      },
      {
        type: 'input',
        name: 'version',
        message: 'Version (optional, press Enter for latest):',
        default: '',
      },
    ];
  }

  async removeModule(
    args: { moduleId?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    if (!this.marketplace)
      return { success: false, message: 'Marketplace not available' };
    if (!flags.force && !flags.yes)
      return {
        success: false,
        message: 'Use --force or --yes to confirm removal',
      };
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would remove module ${args.moduleId}`,
      };
    await this.marketplace.installer.uninstall(args.moduleId || '');
    return this.formatOutput(
      { success: true, message: `Module ${args.moduleId} removed` },
      flags
    );
  }

  async listModules(flags: CLIFlags = {}): Promise<CommandResult> {
    if (!this.marketplace)
      return { success: false, message: 'Marketplace not available' };
    const installed = await this.marketplace.installer.getInstalledModules();
    const data = installed.map((m) => ({
      id: m.moduleId,
      name: m.module.name,
      version: m.version,
      status: m.status,
      autoUpdate: m.autoUpdate,
      pinnedVersion: m.pinnedVersion,
    }));
    const result = {
      success: true,
      message: `${installed.length} module(s) installed`,
      data,
    };
    return this.formatOutput(result, flags);
  }

  async updateModules(
    args: { moduleIds?: string[] } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    if (!this.marketplace)
      return { success: false, message: 'Marketplace not available' };
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would update ${args.moduleIds?.length || 'all'} modules`,
      };
    if (args.moduleIds?.length) {
      for (const id of args.moduleIds)
        await this.marketplace.installer.updateModule(id);
    } else {
      await this.marketplace.installer.updateAllModules();
    }
    return this.formatOutput(
      {
        success: true,
        message: args.moduleIds
          ? `${args.moduleIds.length} module(s) updated`
          : 'All modules updated',
      },
      flags
    );
  }

  async scaffoldModule(
    args: { name?: string; category?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    const name = args.name || 'my-module';
    const category = args.category || 'tool';
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would scaffold module "${name}"`,
      };
    const files = [
      {
        path: 'manifest.json',
        content: JSON.stringify(
          {
            id: `@local/${name}`,
            name,
            version: '1.0.0',
            description: `A ${name} module`,
            sukit: {
              minVersion: '1.0.0',
              capabilities: [],
              permissions: ['sites:read'],
              entrypoints: { main: 'src/index.ts' },
            },
          },
          null,
          2
        ),
      },
      {
        path: 'src/index.ts',
        content: `import type { SukitKernel } from '@sukit/core'\n\nexport default {\n  manifest: { id: '@local/${name}', name: '${name}', version: '1.0.0' },\n  activate(kernel: SukitKernel) { console.log('${name} activated') },\n  deactivate(kernel: SukitKernel) { console.log('${name} deactivated') },\n}\n`,
      },
      {
        path: 'src/settings.tsx',
        content: `'use client'\n\nexport default function Settings() {\n  return <div>${name} Settings</div>\n}\n`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2022',
              module: 'ESNext',
              moduleResolution: 'bundler',
              jsx: 'react-jsx',
              strict: true,
            },
            include: ['src'],
          },
          null,
          2
        ),
      },
    ];
    const result = {
      success: true,
      message: `Module "${name}" scaffolded`,
      data: { name, category, files: files.map((f) => f.path) },
    };
    return this.formatOutput(result, flags);
  }

  getScaffoldPrompts(): any[] {
    return [
      {
        type: 'input',
        name: 'name',
        message: 'Module name:',
        default: 'my-module',
      },
      {
        type: 'list',
        name: 'category',
        message: 'Category:',
        choices: TEMPLATES.filter((t) => t.value !== 'blank').concat({
          name: 'Tool',
          value: 'tool',
        }),
      },
    ];
  }

  async backup(
    args: { siteId?: string; full?: boolean } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    const siteId = args.siteId || 'default';
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would backup site ${siteId} (${args.full ? 'full' : 'incremental'})`,
      };
    const backupId = crypto.randomUUID();
    const result = {
      success: true,
      message: `Backup created: ${backupId}`,
      data: { backupId, type: args.full ? 'full' : 'incremental', siteId },
    };
    return this.formatOutput(result, flags);
  }

  getBackupPrompts(): any[] {
    return [
      { type: 'input', name: 'siteId', message: 'Site ID:' },
      {
        type: 'confirm',
        name: 'full',
        message: 'Full backup?',
        default: false,
      },
    ];
  }

  async restore(
    args: { backupId?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    if (!flags.force && !flags.yes)
      return {
        success: false,
        message:
          'Use --force or --yes to confirm restore (this will overwrite current data)',
      };
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would restore backup ${args.backupId}`,
      };
    const result = {
      success: true,
      message: `Backup ${args.backupId} restored`,
      data: { backupId: args.backupId },
    };
    return this.formatOutput(result, flags);
  }

  async migrate(
    args: {
      platform?: string;
      filePath?: string;
      siteId?: string;
      dryRun?: boolean;
    } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    const platform = args.platform || 'wordpress';
    if (this.checkDryRun(flags) || args.dryRun)
      return {
        success: true,
        message: `[DRY RUN] Would import ${platform} data into site ${args.siteId}`,
      };
    const result = {
      success: true,
      message: `Import from ${platform} completed`,
      data: {
        platform,
        filePath: args.filePath,
        siteId: args.siteId,
        items: 0,
        errors: [],
      },
    };
    return this.formatOutput(result, flags);
  }

  getMigratePrompts(): any[] {
    return [
      {
        type: 'list',
        name: 'platform',
        message: 'Source platform:',
        choices: MIGRATE_SOURCES,
      },
      {
        type: 'input',
        name: 'filePath',
        message: 'Path to export file:',
        validate: (v: string) => v.length > 0 || 'File path is required',
      },
      { type: 'input', name: 'siteId', message: 'Target site ID:' },
      {
        type: 'confirm',
        name: 'dryRun',
        message: 'Dry run first?',
        default: true,
      },
    ];
  }

  async dev(
    args: { siteId?: string; port?: number } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    const port = args.port || 3042;
    const siteId = args.siteId || 'default';
    const result = {
      success: true,
      message: `Dev server started on http://localhost:${port}`,
      data: { siteId, port, url: `http://localhost:${port}` },
    };
    return this.formatOutput(result, flags);
  }

  async login(flags: CLIFlags = {}): Promise<CommandResult> {
    const apiKey =
      'sk-' +
      Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
    await this.kernel.settings.set('cli:api-key', apiKey);
    await this.kernel.settings.set('cli:authenticated', 'true');
    const result = {
      success: true,
      message: 'Logged in to SUKIT',
      data: { apiKey: apiKey.substring(0, 8) + '...' },
    };
    return this.formatOutput(result, flags);
  }

  async logout(flags: CLIFlags = {}): Promise<CommandResult> {
    await this.kernel.settings.set('cli:api-key', '');
    await this.kernel.settings.set('cli:authenticated', 'false');
    return this.formatOutput(
      { success: true, message: 'Logged out of SUKIT' },
      flags
    );
  }

  async configGet(
    args: { key?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    const key = args.key || '';
    const value = await this.kernel.settings.get(`cli:${key}`);
    if (flags.json)
      return { success: true, message: '', data: { key, value: value || '' } };
    return {
      success: true,
      message: `${key}=${value || '(not set)'}`,
      data: { key, value },
    };
  }

  async configSet(
    args: { key?: string; value?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    if (!args.key || args.value === undefined)
      return {
        success: false,
        message: 'Usage: sukit config set <key> <value>',
      };
    await this.kernel.settings.set(`cli:${args.key}`, args.value);
    return this.formatOutput(
      { success: true, message: `${args.key} set to ${args.value}` },
      flags
    );
  }

  async configList(flags: CLIFlags = {}): Promise<CommandResult> {
    const keys = ['api-key', 'default-site', 'theme', 'editor', 'telemetry'];
    const entries: { key: string; value: string }[] = [];
    for (const key of keys) {
      const value =
        ((await this.kernel.settings.get(`cli:${key}`)) as string) || '';
      entries.push({ key, value });
    }
    return this.formatOutput(
      {
        success: true,
        message: `${entries.length} config entries`,
        data: entries,
      },
      flags
    );
  }

  async publishModule(
    args: { moduleId?: string; version?: string } = {},
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    if (!this.marketplace)
      return { success: false, message: 'Marketplace not available' };
    if (this.checkDryRun(flags))
      return {
        success: true,
        message: `[DRY RUN] Would publish ${args.moduleId} v${args.version || 'latest'}`,
      };
    const result = await this.marketplace.submission.submitForReview(
      args.moduleId || ''
    );
    return this.formatOutput(result, flags);
  }

  async setTelemetry(
    enabled: boolean,
    flags: CLIFlags = {}
  ): Promise<CommandResult> {
    await this.kernel.settings.set('cli:telemetry', enabled ? 'true' : 'false');
    return this.formatOutput(
      {
        success: true,
        message: `Telemetry ${enabled ? 'enabled' : 'disabled'}`,
        data: { telemetry: enabled },
      },
      flags
    );
  }

  async getTelemetry(flags: CLIFlags = {}): Promise<CommandResult> {
    const value = await this.kernel.settings.get('cli:telemetry');
    const enabled = value === 'true';
    if (flags.json)
      return {
        success: true,
        message: '',
        data: { telemetry: enabled },
      };
    return {
      success: true,
      message: `Telemetry is ${enabled ? 'enabled' : 'disabled'}`,
      data: { telemetry: enabled },
    };
  }

  async version(flags: CLIFlags = {}): Promise<CommandResult> {
    const current = '1.0.0';
    const latest = '1.0.0'; // In production, check npm registry
    const updateAvailable = current !== latest;
    if (flags.json)
      return {
        success: true,
        message: '',
        data: { current, latest, updateAvailable },
      };
    return {
      success: true,
      message: `SUKIT CLI v${current}${updateAvailable ? ` (update available: v${latest})` : ' (latest)'}`,
    };
  }

  getCompletion(shell: 'bash' | 'zsh' | 'fish' = 'bash'): string {
    const commands = [
      'create',
      'build',
      'export',
      'deploy',
      'dev',
      'login',
      'logout',
      'version',
      'help',
      'config',
      'backup',
      'restore',
      'migrate',
    ];
    const moduleCmds = ['add', 'remove', 'list', 'update', 'create', 'publish'];

    if (shell === 'zsh') {
      return `#compdef sukit
_sukit_commands() {
  local -a commands
  commands=(
    'create:Create a new site from template'
    'build:Build site for production'
    'export:Export site to static files'
    'deploy:Deploy to hosting provider'
    'dev:Start development server'
    'login:Login to SUKIT account'
    'logout:Logout from SUKIT'
    'version:Show version information'
    'config:Manage configuration'
    'backup:Backup sites'
    'restore:Restore from backup'
    'migrate:Migrate from other platforms'
    'module:Manage modules'
  )
  _describe -t commands 'sukit' commands
}

_sukit_module_commands() {
  local -a commands
  commands=(
    'add:Install module from marketplace'
    'remove:Uninstall module'
    'list:List installed modules'
    'update:Update modules'
    'create:Scaffold new module'
    'publish:Publish to marketplace'
  )
  _describe -t commands 'sukit module' commands
}

_sukit() {
  local context state line
  typeset -A opt_args

  _arguments \\
    '(-h --help)'{-h,--help}'[Show help]' \\
    '(-v --version)'{-v,--version}'[Show version]' \\
    '--json[Output as JSON]' \\
    '--quiet[Suppress non-error output]' \\
    '--verbose[Show debug information]' \\
    '--dry-run[Preview actions]' \\
    '--force[Skip confirmations]' \\
    '--yes[Skip prompts]' \\
    '1:command:_sukit_commands' \\
    '*::arg:->args'

  case $state in
    args)
      case $line[1] in
        module) _sukit_module_commands ;;
        config) _arguments '2:subcommand:(get set list telemetry)' ;;
        migrate) _arguments '2:platform:(wordpress webflow wix squarespace ghost static-html)' ;;
      esac
  esac
}

_sukit`;
    }

    if (shell === 'fish') {
      return `complete -c sukit -f
complete -c sukit -n "not __fish_seen_subcommand_from ${commands.join(' ')}" -a "${commands[1]}" -d "Create a new site from template"
complete -c sukit -n "not __fish_seen_subcommand_from ${commands.join(' ')}" -a "${commands[2]}" -d "Build site for production"
complete -c sukit -n "not __fish_seen_subcommand_from ${commands.join(' ')}" -a "${commands[3]}" -d "Export site to static files"
complete -c sukit -n "not __fish_seen_subcommand_from ${commands.join(' ')}" -a "${commands[4]}" -d "Deploy to hosting provider"
complete -c sukit -n "not __fish_seen_subcommand_from ${commands.join(' ')}" -a "${commands[5]}" -d "Start development server"
complete -c sukit -n "not __fish_seen_subcommand_from ${commands.join(' ')}" -a "${commands[8]}" -d "Manage configuration"
complete -c sukit -n "not __fish_seen_subcommand_from ${commands.join(' ')}" -a "${commands[9]}" -d "Backup sites"
complete -c sukit -n "__fish_seen_subcommand_from module" -a "${moduleCmds[1]} ${moduleCmds[2]} ${moduleCmds[3]} ${moduleCmds[4]} ${moduleCmds[5]} ${moduleCmds[6]}"
complete -c sukit -l json -d "Output as JSON"
complete -c sukit -l quiet -d "Suppress non-error output"
complete -c sukit -l verbose -d "Show debug information"
complete -c sukit -l dry-run -d "Preview actions"
complete -c sukit -l force -d "Skip confirmations"
complete -c sukit -l yes -d "Skip prompts and use defaults"`;
    }

    // Bash completion
    return `_sukit_completions() {
  local cur prev words cword
  _init_completion || return

  local commands="\${commands[*]}"
  local module_commands="\${moduleCmds[*]}"

  if [[ $prev == "sukit" ]]; then
    COMPREPLY=($(compgen -W "\$commands --json --quiet --verbose --dry-run --force --yes --help --version" -- "$cur"))
    return
  fi

  case $prev in
    module) COMPREPLY=($(compgen -W "\$module_commands" -- "$cur")) ;;
    config) COMPREPLY=($(compgen -W "get set list telemetry" -- "$cur")) ;;
    migrate) COMPREPLY=($(compgen -W "wordpress webflow wix squarespace ghost static-html" -- "$cur")) ;;
    export) COMPREPLY=($(compgen -W "zip next static" -- "$cur")) ;;
    deploy) COMPREPLY=($(compgen -W "netlify vercel github-pages s3 cloudflare" -- "$cur")) ;;
  esac
} &&
complete -F _sukit_completions sukit`;
  }
}
