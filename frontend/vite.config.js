import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import crypto from 'crypto'
import { cacheManagementPlugin } from './vite-cache-plugin.js'
import { bundleAnalyzer } from './rollup-plugin-visualizer.config.js'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react({
      // React optimization
      jsxRuntime: 'automatic',
      fastRefresh: true,
      include: "**/*.{jsx,tsx}",
    }),
    cacheManagementPlugin(),
    // Bundle analyzer (only in analysis mode)
    process.env.ANALYZE && bundleAnalyzer,
    // Enhanced image optimization
    process.env.NODE_ENV === 'production' && viteStaticCopy({
      targets: [
        {
          src: 'public/images/**/*',
          dest: 'images'
        }
      ]
    }),
    // Subresource Integrity for production
    process.env.NODE_ENV === 'production' && {
      name: 'subresource-integrity',
      generateBundle(options, bundle) {
        // Add SRI hashes to critical assets
        Object.keys(bundle).forEach(fileName => {
          const chunk = bundle[fileName]
          if (chunk.type === 'chunk' && chunk.isEntry) {
            const source = chunk.code || chunk.source
            const hash = crypto.createHash('sha384').update(source).digest('base64')
            chunk.sriHash = `sha384-${hash}`
            console.log(`🔒 SRI hash generated for ${fileName}`)
          }
        })
      }
    },
    // Enhanced PWA Support
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Uganda Investment One Stop Center',
        short_name: 'OSC Uganda',
        description: 'Uganda Investment One Stop Center - Investing in Uganda Simplified',
        theme_color: '#dc2626',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'images/oneStopCenter-logo.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          }
        ]
      }
    }),
  ].filter(Boolean),
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/types': path.resolve(__dirname, './src/types')
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    hmr: {
      overlay: true,
      port: 3001
    },
    watch: {
      usePolling: process.env.NODE_ENV === 'development',
      interval: 100
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    assetsDir: 'assets',
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation'
            }
            if (id.includes('@heroicons') || id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (id.includes('@headlessui')) {
              return 'vendor-ui'
            }
            // Group other vendor dependencies
            return 'vendor-misc'
          }
          
          // Feature-based chunking with size optimization
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('/')[0].replace('.jsx', '').replace('.tsx', '')
            return `page-${pageName.toLowerCase()}`
          }
          
          // Split large components bundle
          if (id.includes('/components/')) {
            // Split heavy components separately
            if (id.includes('PerformanceDashboard') || id.includes('InvoiceGenerator')) {
              return 'components-heavy'
            }
            if (id.includes('Calculator') || id.includes('BusinessRegistration')) {
              return 'components-forms'
            }
            return 'components-common'
          }
          
          if (id.includes('/utils/')) {
            // Split utils by functionality
            if (id.includes('security') || id.includes('errorHandling') || id.includes('monitoring')) {
              return 'utils-system'
            }
            return 'utils-core'
          }
        },
        // Enhanced file naming with cache busting
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      },
      external: [],
      onwarn(warning, warn) {
        // Suppress specific warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        if (warning.code === 'EVAL' && warning.id?.includes('node_modules')) return
        warn(warning)
      }
    },
    // Advanced optimization
    assetsInlineLimit: 4096, // 4kb
    cssCodeSplit: true,
    emptyOutDir: true
  },
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  },
  publicDir: 'public',
  assetsInclude: ['**/*.pdf', '**/*.docx', '**/*.xlsx', '**/*.pptx'],
  
  // Advanced configuration
  esbuild: {
    target: 'esnext',
    platform: 'browser',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'framer-motion',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid', 
      'lucide-react',
      '@headlessui/react'
    ],
    exclude: [
      'vite', 
      '@vitejs/plugin-react',
      // Exclude your custom utilities to prevent scan errors
      './utils/cacheManager.js',
      './utils/security.js',
      './utils/errorHandling.js',
      './utils/analytics.js',
      './utils/dataValidation.js',
      './utils/monitoring.js'
    ],
    force: process.env.NODE_ENV === 'development'
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __NODE_ENV__: JSON.stringify(process.env.NODE_ENV)
  }
})