// Enhanced Image Optimization Configuration
import { defineConfig } from 'vite'

export const imageOptimizationConfig = {
  // Advanced image optimization settings
  imageOptimization: {
    // JPEG optimization
    mozjpeg: {
      quality: 85,
      progressive: true,
    },
    // PNG optimization
    optipng: {
      optimizationLevel: 7,
    },
    // WebP conversion
    webp: {
      quality: 85,
      lossless: false,
      method: 6,
    },
    // AVIF conversion for modern browsers
    avif: {
      quality: 70,
      speed: 2,
    },
    // SVG optimization
    svgo: {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
              removeUselessStrokeAndFill: false,
            },
          },
        },
        'removeDimensions',
      ],
    },
  },
  
  // Modern image formats with fallbacks
  modernImageFormats: {
    generateWebP: true,
    generateAVIF: true,
    fallbackFormats: ['jpg', 'png'],
  },
  
  // Responsive image generation
  responsiveImages: {
    sizes: [320, 480, 768, 1024, 1280, 1920],
    formats: ['webp', 'avif', 'jpg'],
    quality: {
      webp: 85,
      avif: 70,
      jpg: 85,
    },
  },
  
  // Image lazy loading configuration
  lazyLoading: {
    enabled: true,
    placeholder: 'blur',
    fadeInDuration: 300,
    rootMargin: '50px',
  },
}

// Enhanced image processing utilities
export const imageUtils = {
  // Generate responsive image srcSet
  generateSrcSet: (imagePath, sizes = [320, 480, 768, 1024, 1280, 1920]) => {
    const basePath = imagePath.replace(/\.[^/.]+$/, "")
    const extension = imagePath.split('.').pop()
    
    return sizes.map(size => `${basePath}-${size}w.${extension} ${size}w`).join(', ')
  },
  
  // Generate modern format sources
  generateModernSources: (imagePath) => {
    const basePath = imagePath.replace(/\.[^/.]+$/, "")
    
    return [
      {
        srcSet: `${basePath}.avif`,
        type: 'image/avif'
      },
      {
        srcSet: `${basePath}.webp`,
        type: 'image/webp'
      }
    ]
  },
  
  // Preload critical images
  preloadCriticalImages: [
    './images/oneStopCenter-logo.jpeg',
    './images/uganda-coat-of-arms.png',
    './images/uganda-background.jpeg',
  ],
  
  // Prefetch secondary images
  prefetchImages: [
    './images/lake-bunyonyi-uganda.jpg',
    './images/Pride.webp',
    './images/Tourism.webp',
    './images/Infrastucture.webp',
  ],
}

export default imageOptimizationConfig