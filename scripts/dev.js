import { spawn } from 'child_process';
import path from 'path';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('Starting both main site and admin portal dev servers...');

// Start Main project dev server
const mainDev = spawn(npmCmd, ['run', 'dev:main'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

// Start Admin portal dev server
const adminDir = path.join(process.cwd(), 'admin-portal');
const adminDev = spawn(npmCmd, ['run', 'dev'], {
  cwd: adminDir,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

function logWithPrefix(prefix, data) {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      console.log(`${prefix} ${trimmed}`);
    }
  }
}

mainDev.stdout.on('data', (data) => logWithPrefix('[Main]', data));
mainDev.stderr.on('data', (data) => logWithPrefix('[Main ERROR]', data));

adminDev.stdout.on('data', (data) => logWithPrefix('[Admin]', data));
adminDev.stderr.on('data', (data) => logWithPrefix('[Admin ERROR]', data));

// Handle exit of processes
mainDev.on('close', (code) => {
  console.log(`[Main] process exited with code ${code}`);
  adminDev.kill();
  process.exit(code || 0);
});

adminDev.on('close', (code) => {
  console.log(`[Admin] process exited with code ${code}`);
  mainDev.kill();
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  mainDev.kill();
  adminDev.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  mainDev.kill();
  adminDev.kill();
  process.exit();
});
