import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['theme/index.tsx', 'theme/tags.tsx'],
  format: 'esm',
  dts: true,
  name: 'cardano-lightning-network-theme',
  outExtension: () => ({ js: '.js' }),
  external: ['nextra']
})
