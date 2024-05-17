import path from 'path';
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    include: [path.join(__dirname, '**/*.test.ts')],
    disableConsoleIntercept: true,
  },
  plugins: [swc.vite(), tsconfigPaths()],
});
