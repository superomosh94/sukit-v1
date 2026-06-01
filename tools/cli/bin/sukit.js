#!/usr/bin/env node
const [,, command, ...args] = process.argv
const flags = { yes: false, json: false, quiet: false, verbose: false, dryRun: false, force: false }

for (const flag of ['--yes', '-y']) { const i = process.argv.indexOf(flag); if (i > -1) { flags.yes = true; process.argv.splice(i, 1) } }
for (const flag of ['--json']) { const i = process.argv.indexOf(flag); if (i > -1) { flags.json = true; process.argv.splice(i, 1) } }
for (const flag of ['--quiet']) { const i = process.argv.indexOf(flag); if (i > -1) { flags.quiet = true; process.argv.splice(i, 1) } }
for (const flag of ['--verbose', '-V']) { const i = process.argv.indexOf(flag); if (i > -1) { flags.verbose = true; process.argv.splice(i, 1) } }
for (const flag of ['--dry-run', '-n']) { const i = process.argv.indexOf(flag); if (i > -1) { flags.dryRun = true; process.argv.splice(i, 1) } }
for (const flag of ['--force', '-f']) { const i = process.argv.indexOf(flag); if (i > -1) { flags.force = true; process.argv.splice(i, 1) } }

const HELP = `
SUKIT CLI v1.0.0
Usage: npx sukit <command> [options] [arguments]

Commands:
  create [name]        Create a new site from template
  build <siteId>       Build site for production
  export <siteId>      Export site files
  deploy <siteId>      Deploy to hosting provider
  dev [siteId]         Start development server
  login                Login to SUKIT account
  logout               Logout from SUKIT
  version              Show version information

  module add <id>      Install module from marketplace
  module remove <id>   Uninstall a module
  module list          List installed modules
  module update [ids]  Update installed modules
  module create        Scaffold a new module
  module publish       Publish module to marketplace

  backup <siteId>      Backup a site
  restore <backupId>   Restore from backup
  migrate <platform>   Import from external platform

  config get <key>     Get configuration value
  config set <key> <v> Set configuration value
  config list          List all configuration

Options:
  -y, --yes            Skip prompts and use defaults
  --json               Output as JSON
  --quiet              Suppress non-error output
  -V, --verbose        Show debug information
  -n, --dry-run        Preview actions without executing
  -f, --force          Skip confirmations
  -h, --help           Show this help message

Examples:
  npx sukit create my-site -y
  npx sukit create --template blog
  npx sukit module add @sukit/seo
  npx sukit backup site_123 --json
  npx sukit migrate wordpress export.xml site_123 --dry-run
  npx sukit config set api-key sk_xxxx
`.trim()

function printHelp() { console.log(HELP); process.exit(0) }
function printVersion() { console.log('SUKIT CLI v1.0.0'); process.exit(0) }

if (process.argv.includes('-h') || process.argv.includes('--help') || command === 'help') printHelp()
if (process.argv.includes('-v') && process.argv.includes('--version')) printVersion()

// Parse subcommands
let subcommand = null
let parsedArgs = {}
if (command === 'module' || command === 'config') {
  subcommand = args[0]
  parsedArgs = { _: args.slice(1) }
} else {
  parsedArgs = { _: args }
}

const parsed = { command, subcommand, args: parsedArgs._, flags }

if (flags.json) {
  console.log(JSON.stringify(parsed, null, 2))
} else if (flags.quiet && command !== 'list') {
  // Silent execution
} else if (flags.verbose) {
  console.log('SUKIT CLI - verbose mode')
  console.log(`Command: ${command}${subcommand ? ' ' + subcommand : ''}`)
  console.log(`Args: ${parsedArgs._.join(', ') || '(none)'}`)
  console.log(`Flags: ${Object.entries(flags).filter(([,v]) => v).map(([k]) => k).join(', ') || '(none)'}`)
  console.log('---')
  require('./runner').default.run(command, subcommand, parsedArgs._, flags)
} else {
  require('./runner').default.run(command, subcommand, parsedArgs._, flags)
}
