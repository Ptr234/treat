#!/usr/bin/env node

/**
 * Security Audit Script for OneStopCentre Uganda
 * Comprehensive security checks for production readiness
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SecurityAudit {
  constructor() {
    this.issues = [];
    this.passed = [];
    this.projectRoot = __dirname;
  }

  log(type, message, details = '') {
    const timestamp = new Date().toISOString();
    const entry = { type, message, details, timestamp };
    
    if (type === 'PASS') {
      this.passed.push(entry);
      console.log(`✅ ${message}`);
    } else {
      this.issues.push(entry);
      console.log(`❌ ${type}: ${message}${details ? ' - ' + details : ''}`);
    }
  }

  // Check for potential security issues in code
  auditCodeSecurity() {
    console.log('\n🔍 Auditing Code Security...');
    
    const dangerousPatterns = [
      { pattern: /eval\s*\(/, severity: 'HIGH', description: 'Use of eval() function' },
      { pattern: /innerHTML\s*=/, severity: 'MEDIUM', description: 'Use of innerHTML (XSS risk)' },
      { pattern: /document\.write\s*\(/, severity: 'HIGH', description: 'Use of document.write' },
      { pattern: /setTimeout\s*\(\s*["'`]/, severity: 'MEDIUM', description: 'setTimeout with string argument' },
      { pattern: /\.html\s*\(/, severity: 'MEDIUM', description: 'Direct HTML insertion' },
      { pattern: /process\.env\.\w+/g, severity: 'INFO', description: 'Environment variable usage' }
    ];

    const filesToCheck = this.getAllJSFiles();
    
    filesToCheck.forEach(filePath => {
      try {
        const content = readFileSync(filePath, 'utf8');
        
        dangerousPatterns.forEach(({ pattern, severity, description }) => {
          const matches = content.match(pattern);
          if (matches) {
            this.log(severity, `${description} found in ${filePath.replace(this.projectRoot, '.')}`);
          }
        });
      } catch (error) {
        this.log('ERROR', `Failed to read file: ${filePath}`, error.message);
      }
    });

    this.log('PASS', 'Code security audit completed');
  }

  // Check environment configuration
  auditEnvironmentConfig() {
    console.log('\n🔍 Auditing Environment Configuration...');
    
    // Check backend .env
    const backendEnvPath = join(this.projectRoot, 'backend', '.env');
    try {
      const envContent = readFileSync(backendEnvPath, 'utf8');
      
      // Check for weak JWT secrets
      if (envContent.includes('JWT_SECRET=') && envContent.includes('onestopcentre_uganda_super_secure_jwt_secret_key_2024_development')) {
        this.log('HIGH', 'Using default JWT secret in backend/.env', 'Change to a secure random value');
      } else {
        this.log('PASS', 'JWT secret configuration looks secure');
      }
      
      // Check for proper environment setup
      if (envContent.includes('USE_MOCK_DB=true')) {
        this.log('INFO', 'Using mock database (development mode)');
      }
      
    } catch (error) {
      this.log('ERROR', 'Could not read backend/.env file', error.message);
    }

    this.log('PASS', 'Environment configuration audit completed');
  }

  // Check for exposed secrets or sensitive data
  auditSecretsExposure() {
    console.log('\n🔍 Auditing for Exposed Secrets...');
    
    const secretPatterns = [
      { pattern: /api[_-]?key[\s]*[:=][\s]*["']?[\w-]{16,}["']?/i, name: 'API Key' },
      { pattern: /secret[_-]?key[\s]*[:=][\s]*["']?[\w-]{16,}["']?/i, name: 'Secret Key' },
      { pattern: /password[\s]*[:=][\s]*["']?[\w-]{8,}["']?/i, name: 'Password' },
      { pattern: /token[\s]*[:=][\s]*["']?[\w-]{16,}["']?/i, name: 'Token' },
      { pattern: /-----BEGIN[\s\w]*PRIVATE KEY-----/, name: 'Private Key' }
    ];

    const filesToCheck = this.getAllTextFiles();
    
    filesToCheck.forEach(filePath => {
      try {
        const content = readFileSync(filePath, 'utf8');
        
        secretPatterns.forEach(({ pattern, name }) => {
          if (pattern.test(content)) {
            this.log('HIGH', `Potential ${name} found in ${filePath.replace(this.projectRoot, '.')}`);
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.log('PASS', 'Secrets exposure audit completed');
  }

  // Check dependencies for known vulnerabilities
  auditDependencies() {
    console.log('\n🔍 Auditing Dependencies...');
    
    try {
      const frontendPackage = JSON.parse(readFileSync(join(this.projectRoot, 'frontend', 'package.json'), 'utf8'));
      const backendPackage = JSON.parse(readFileSync(join(this.projectRoot, 'backend', 'package.json'), 'utf8'));
      
      // Check for known problematic packages
      const problematicPackages = [
        'lodash', 'moment', 'request', 'node-uuid', 'validator'
      ];
      
      const allDeps = {
        ...frontendPackage.dependencies,
        ...frontendPackage.devDependencies,
        ...backendPackage.dependencies,
        ...backendPackage.devDependencies
      };
      
      problematicPackages.forEach(pkg => {
        if (allDeps[pkg]) {
          this.log('MEDIUM', `Consider replacing ${pkg} with safer alternatives`);
        }
      });

      this.log('PASS', 'Dependencies audit completed');
    } catch (error) {
      this.log('ERROR', 'Failed to read package.json files', error.message);
    }
  }

  // Check CORS and security headers configuration
  auditSecurityHeaders() {
    console.log('\n🔍 Auditing Security Headers...');
    
    try {
      // Check CORS configuration
      const corsPath = join(this.projectRoot, 'backend', 'middleware', 'corsMiddleware.js');
      const corsContent = readFileSync(corsPath, 'utf8');
      
      if (corsContent.includes('callback(null, true)') && !corsContent.includes('NODE_ENV')) {
        this.log('MEDIUM', 'CORS allows all origins without environment check');
      } else {
        this.log('PASS', 'CORS configuration looks secure');
      }
      
      // Check for security middleware
      const serverPath = join(this.projectRoot, 'backend', 'server.js');
      const serverContent = readFileSync(serverPath, 'utf8');
      
      if (serverContent.includes('helmet()')) {
        this.log('PASS', 'Helmet security middleware is configured');
      } else {
        this.log('HIGH', 'Missing Helmet security middleware');
      }
      
      if (serverContent.includes('rateLimit')) {
        this.log('PASS', 'Rate limiting is configured');
      } else {
        this.log('MEDIUM', 'Missing rate limiting');
      }
      
    } catch (error) {
      this.log('ERROR', 'Failed to audit security headers', error.message);
    }
  }

  // Check for proper error handling
  auditErrorHandling() {
    console.log('\n🔍 Auditing Error Handling...');
    
    try {
      const serverPath = join(this.projectRoot, 'backend', 'server.js');
      const serverContent = readFileSync(serverPath, 'utf8');
      
      if (serverContent.includes('uncaughtException') && serverContent.includes('unhandledRejection')) {
        this.log('PASS', 'Global error handlers are configured');
      } else {
        this.log('HIGH', 'Missing global error handlers');
      }
      
      if (serverContent.includes('gracefulShutdown')) {
        this.log('PASS', 'Graceful shutdown is implemented');
      } else {
        this.log('MEDIUM', 'Missing graceful shutdown');
      }
      
    } catch (error) {
      this.log('ERROR', 'Failed to audit error handling', error.message);
    }
  }

  // Helper methods
  getAllJSFiles() {
    const jsFiles = [];
    const searchDirs = ['frontend/src', 'backend'];
    
    searchDirs.forEach(dir => {
      const fullPath = join(this.projectRoot, dir);
      try {
        this.findFiles(fullPath, /\.(js|jsx|ts|tsx)$/, jsFiles);
      } catch (error) {
        // Directory might not exist
      }
    });
    
    return jsFiles;
  }

  getAllTextFiles() {
    const textFiles = [];
    const searchDirs = ['.'];
    
    searchDirs.forEach(dir => {
      const fullPath = join(this.projectRoot, dir);
      this.findFiles(fullPath, /\.(js|jsx|ts|tsx|json|md|env|yml|yaml)$/, textFiles);
    });
    
    return textFiles.filter(file => !file.includes('node_modules'));
  }

  findFiles(dir, pattern, fileList) {
    try {
      const files = readdirSync(dir);
      
      files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          this.findFiles(filePath, pattern, fileList);
        } else if (stat.isFile() && pattern.test(file)) {
          fileList.push(filePath);
        }
      });
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  // Run all audits
  async runFullAudit() {
    console.log('🛡️  OneStopCentre Uganda Security Audit\n');
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    
    this.auditCodeSecurity();
    this.auditEnvironmentConfig();
    this.auditSecretsExposure();
    this.auditDependencies();
    this.auditSecurityHeaders();
    this.auditErrorHandling();
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Security Audit Report');
    console.log('========================');
    
    const highIssues = this.issues.filter(i => i.type === 'HIGH');
    const mediumIssues = this.issues.filter(i => i.type === 'MEDIUM');
    const infoIssues = this.issues.filter(i => i.type === 'INFO');
    const errors = this.issues.filter(i => i.type === 'ERROR');
    
    console.log(`✅ Passed Checks: ${this.passed.length}`);
    console.log(`🔴 High Issues: ${highIssues.length}`);
    console.log(`🟡 Medium Issues: ${mediumIssues.length}`);
    console.log(`ℹ️  Info Issues: ${infoIssues.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (highIssues.length === 0 && errors.length === 0) {
      console.log('\n🎉 Security audit passed! Application is ready for production.');
    } else {
      console.log('\n⚠️  Please address the issues above before deploying to production.');
    }
    
    console.log(`\n📅 Completed at: ${new Date().toISOString()}`);
  }
}

// Run the audit
const audit = new SecurityAudit();
audit.runFullAudit();