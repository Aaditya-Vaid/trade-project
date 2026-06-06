import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await mkdir('dist/assets', { recursive: true });
await copyFile('src/styles.css', 'dist/assets/styles.css');
const html = await readFile('index.html', 'utf8');
await writeFile(
  'dist/index.html',
  html.replace('/src/styles.css', '/assets/styles.css').replace('/src/main.ts', '/assets/main.js'),
);
