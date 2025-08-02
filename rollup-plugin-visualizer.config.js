// Bundle analysis configuration
import { visualizer } from 'rollup-plugin-visualizer'

export const bundleAnalyzer = visualizer({
  filename: 'dist/bundle-analysis.html',
  open: true,
  gzipSize: true,
  brotliSize: true,
  template: 'treemap', // or 'sunburst', 'network'
})