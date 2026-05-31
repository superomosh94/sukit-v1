import { spawn } from 'child_process';
import { resolve } from 'path';

export async function serveCommand(): Promise<void> {
  const serverPath = resolve(process.cwd(), 'apps/server');
  const child = spawn('node', ['dist/index.js'], {
    cwd: serverPath,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  process.on('SIGINT', () => {
    child.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit(0);
  });
}
