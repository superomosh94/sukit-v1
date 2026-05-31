module.exports = {
  apps: [
    {
      name: 'sukit-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: '3000' },
      watch: ['../../packages'],
      watch_delay: 1000,
      ignore_watch: ['node_modules', '.next'],
    },
    {
      name: 'sukit-server',
      cwd: './apps/server',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: '3001' },
    },
  ],
};
