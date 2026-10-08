import { copyFile, mkdir } from 'node:fs/promises';
await mkdir(new URL('../public/docs/', import.meta.url), { recursive: true });
await copyFile(new URL('../src/engine.js', import.meta.url), new URL('../public/docs/engine.js', import.meta.url));
await copyFile(new URL('../src/benchmarks.js', import.meta.url), new URL('../public/docs/benchmarks.js', import.meta.url));
