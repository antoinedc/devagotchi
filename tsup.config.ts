import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  format: ['cjs'],
  dts: false,
  clean: true,
  shims: true,
  banner({ format, entry }) {
    if (entry === 'src/cli.ts') {
      return {
        js: '#!/usr/bin/env node',
      };
    }
    return {};
  },
});
