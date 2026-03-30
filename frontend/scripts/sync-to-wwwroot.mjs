import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const targetDir = resolve(process.cwd(), '..', 'wwwroot');

if (!existsSync(distDir)) {
  console.error('[sync-to-wwwroot] Missing dist folder. Run vite build first.');
  process.exit(1);
}

if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

cpSync(distDir, targetDir, { recursive: true, force: true });
console.log(`[sync-to-wwwroot] Synced ${distDir} -> ${targetDir}`);
