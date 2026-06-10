import { spawn } from 'child_process';
import { networkInterfaces } from 'os';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const QRCode = require('qrcode');

const port = process.env.PORT || 3000;
const protocol = process.env.HTTPS ? 'https' : 'http';

function getNetworkIP() {
  const ifaces = networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

async function start() {
  const ip = getNetworkIP();
  const localUrl = `${protocol}://localhost:${port}`;
  const networkUrl = `${protocol}://${ip}:${port}`;

  console.log('');
  console.log('  ▲ Sukit Dev Server');
  console.log('');
  console.log(`  Local:      ${localUrl}`);
  console.log(`  Network:    ${networkUrl}`);
  console.log('');

  try {
    const qr = await QRCode.toString(networkUrl, {
      type: 'terminal',
      small: true,
    });
    console.log(`  QR for mobile preview:\n${qr}`);
  } catch {
    // QR generation is optional
  }

  console.log('');

  const next = spawn(
    'npx',
    ['next', 'dev', '--hostname', '0.0.0.0', '--port', String(port)],
    {
      stdio: 'inherit',
      cwd: new URL('..', import.meta.url).pathname,
      env: { ...process.env, PORT: String(port) },
    }
  );

  process.on('SIGINT', () => {
    next.kill('SIGINT');
    process.exit(0);
  });
}

start();
