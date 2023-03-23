import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/**/*'],
    splitting: false,
    clean: true,
    shims: true,
    outDir: 'dist',
    dts: true,
    format: 'esm',
});
