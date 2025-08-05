import { writeFileSync } from 'fs'
import { resolve } from 'path'

export function cacheManagementPlugin() {
  const buildTimestamp = Date.now()
  const buildVersion = `v${buildTimestamp}`
  
  return {
    name: 'cache-management',
    
    configureServer(server) {
      // Add cache headers and security headers for development server
      server.middlewares.use((req, res, next) => {
        const url = req.url
        
        // Never cache HTML files
        if (url.endsWith('.html') || url === '/') {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
          res.setHeader('Expires', '0')
        }
        
        // Cache static assets for development
        else if (url.match(/\.(js|css|woff2?|ttf|eot|ico|png|jpg|jpeg|svg)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000') // 1 year
        }
        
        // Enhanced Security Headers
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('X-Frame-Options', 'DENY')
        res.setHeader('X-XSS-Protection', '1; mode=block')
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        
        // Content Security Policy with reporting (relaxed for development)
        const isProduction = process.env.NODE_ENV === 'production'
        const cspPolicy = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https:",
          isProduction 
            ? "connect-src 'self' https://api.onestopcentre.ug"
            : "connect-src 'self' ws://localhost:* http://localhost:* https://api.onestopcentre.ug https://fonts.googleapis.com",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "report-uri /api/csp-violations"
        ].join('; ')
        
        res.setHeader('Content-Security-Policy', cspPolicy)
        
        // Add build info header
        res.setHeader('X-Build-Timestamp', buildTimestamp)
        res.setHeader('X-Build-Version', buildVersion)
        
        next()
      })
      
      // CSP violation reporting endpoint
      server.middlewares.use('/api/csp-violations', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const violation = JSON.parse(body)
              console.warn('🚨 CSP Violation Report:', violation)
              // In production, this would be logged to a security monitoring system
            } catch (error) {
              console.error('Error parsing CSP violation report:', error)
            }
            res.writeHead(204)
            res.end()
          })
        } else {
          res.writeHead(405)
          res.end()
        }
      })
    },
    
    generateBundle(options, bundle) {
      // Process index.html during build
      Object.keys(bundle).forEach(fileName => {
        if (fileName === 'index.html') {
          const htmlBundle = bundle[fileName]
          
          // Replace placeholders with actual build info
          htmlBundle.source = htmlBundle.source
            .replace('BUILD_TIMESTAMP_PLACEHOLDER', buildTimestamp)
            .replace('VERSION_PLACEHOLDER', buildVersion)
            .replace('LAST_MODIFIED_PLACEHOLDER', new Date().toISOString())
          
          console.log(`🕒 Build timestamp injected: ${buildTimestamp}`)
          console.log(`📦 Build version: ${buildVersion}`)
        }
      })
    },
    
    writeBundle(options, bundle) {
      // Create a cache manifest file
      const cacheManifest = {
        buildTime: buildTimestamp,
        version: buildVersion,
        lastModified: new Date().toISOString(),
        assets: Object.keys(bundle).filter(file => 
          !file.endsWith('.map') && file !== 'index.html'
        ),
        staticFiles: [
          'manifest.json',
          'offline.html',
          'sw.js',
          'images/oneStopCenter-logo.jpeg',
          'images/uganda-flag.png',
          'images/uganda-coat-of-arms.png'
        ]
      }
      
      // Write cache manifest
      const manifestPath = resolve(options.dir, 'cache-manifest.json')
      writeFileSync(manifestPath, JSON.stringify(cacheManifest, null, 2))
      console.log('📄 Cache manifest created:', manifestPath)
      
      // Create .htaccess file for Apache servers
      const htaccessContent = `
# Cache Management for OSC Uganda
# Generated at: ${new Date().toISOString()}

# Never cache HTML files
<FilesMatch "\\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</FilesMatch>

# Never cache service worker
<Files "sw.js">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Files>

# Cache static assets for 1 year
<FilesMatch "\\.(js|css|woff2?|ttf|eot|ico|png|jpg|jpeg|svg|pdf|docx)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# Cache JSON files for 1 hour
<FilesMatch "\\.json$">
    Header set Cache-Control "public, max-age=3600"
</FilesMatch>

# Add build info headers
Header set X-Build-Timestamp "${buildTimestamp}"
Header set X-Build-Version "${buildVersion}"

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Content Security Policy
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;"
`
      
      const htaccessPath = resolve(options.dir, '.htaccess')
      writeFileSync(htaccessPath, htaccessContent.trim())
      console.log('📄 .htaccess file created:', htaccessPath)
      
      // Create _headers file for Netlify
      const netlifyHeaders = `
# Cache Management for OSC Uganda
# Generated at: ${new Date().toISOString()}

# Never cache HTML files
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
  X-Build-Timestamp: ${buildTimestamp}
  X-Build-Version: ${buildVersion}

# Never cache service worker
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

# Cache static assets for 1 year
/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable

/*.woff
  Cache-Control: public, max-age=31536000, immutable

/*.ttf
  Cache-Control: public, max-age=31536000, immutable

/*.eot
  Cache-Control: public, max-age=31536000, immutable

/*.ico
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.jpeg
  Cache-Control: public, max-age=31536000, immutable

/*.svg
  Cache-Control: public, max-age=31536000, immutable

# Cache JSON files for 1 hour
/*.json
  Cache-Control: public, max-age=3600

# Security headers
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;
`
      
      const netlifyHeadersPath = resolve(options.dir, '_headers')
      writeFileSync(netlifyHeadersPath, netlifyHeaders.trim())
      console.log('📄 _headers file created:', netlifyHeadersPath)
      
      console.log('✅ Cache management files generated successfully')
    }
  }
}

export default cacheManagementPlugin