import * as esbuild from 'esbuild';
import process from 'node:process';

const isProduction = process.env.NODE_ENV === 'production';
const BUILD_APP_VERSION_SUFFIX = `"${process.env.APP_VERSION_SUFFIX ?? ''}"`;

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'build/bundle.js',
  platform: 'node',
  target: ['node22'],
  minify: isProduction,
  format: 'esm',
  sourcemap: !isProduction,
  define: {
    // Optional: define global constants
    // 'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`,
    BUILD_APP_VERSION_SUFFIX,
  },
});
