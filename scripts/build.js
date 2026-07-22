import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

try {
  // Build main project
  console.log('Building main project...');
  execSync('npm run build:main', { stdio: 'inherit', shell: true });

  // Build admin portal
  console.log('Building admin portal...');
  const adminDir = path.join(process.cwd(), 'admin-portal');
  
  console.log('Running npm install in admin portal...');
  execSync('npm install', { cwd: adminDir, stdio: 'inherit', shell: true });
  
  console.log('Running npm run build in admin portal...');
  execSync('npm run build', { cwd: adminDir, stdio: 'inherit', shell: true });

  // Copy admin-portal/dist to dist/admin
  console.log('Copying admin portal build to dist/admin...');
  const srcDir = path.join(adminDir, 'dist');
  const destDir = path.join(process.cwd(), 'dist', 'admin');

  // Helper to copy directory recursively
  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyDir(srcDir, destDir);
  console.log('All builds completed successfully! Deployed output directory: dist/');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
