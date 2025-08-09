// Secure Token Storage - Production Ready
// Replaces localStorage with encrypted storage and secure cookie fallback

class SecureTokenStorage {
  constructor() {
    this.encryptionKey = null;
    this.initializeEncryption();
  }

  // Initialize encryption key from browser's crypto API
  async initializeEncryption() {
    try {
      // Generate or retrieve encryption key
      const storedKey = sessionStorage.getItem('_tk');
      if (storedKey) {
        this.encryptionKey = await this.importKey(storedKey);
      } else {
        this.encryptionKey = await this.generateKey();
        const exportedKey = await this.exportKey(this.encryptionKey);
        sessionStorage.setItem('_tk', exportedKey);
      }
    } catch (error) {
      console.warn('Encryption initialization failed, using fallback method');
      this.encryptionKey = null;
    }
  }

  // Generate AES-GCM encryption key
  async generateKey() {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Export key for storage
  async exportKey(key) {
    const exported = await crypto.subtle.exportKey('raw', key);
    return Array.from(new Uint8Array(exported))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Import key from storage
  async importKey(keyData) {
    const keyBytes = new Uint8Array(
      keyData.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );
    return await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data using AES-GCM
  async encrypt(plaintext) {
    if (!this.encryptionKey) {
      // Fallback to base64 encoding (better than plain text)
      return btoa(plaintext);
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        data
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return Array.from(combined)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.warn('Encryption failed, using fallback');
      return btoa(plaintext);
    }
  }

  // Decrypt data using AES-GCM
  async decrypt(ciphertext) {
    if (!this.encryptionKey) {
      // Fallback from base64
      try {
        return atob(ciphertext);
      } catch {
        return null;
      }
    }

    try {
      const combined = new Uint8Array(
        ciphertext.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.warn('Decryption failed, trying fallback');
      try {
        return atob(ciphertext);
      } catch {
        return null;
      }
    }
  }

  // Secure token storage
  async setToken(token) {
    if (!token) {
      this.removeToken();
      return;
    }

    try {
      // Primary: Encrypted sessionStorage (cleared on browser close)
      const encrypted = await this.encrypt(token);
      sessionStorage.setItem('_auth', encrypted);
      
      // Secondary: httpOnly cookie (if possible via server)
      // For now, use secure cookie with SameSite
      document.cookie = `auth_session=${encrypted}; Secure; SameSite=Strict; Path=/; Max-Age=86400`; // 24 hours
      
      // Tertiary: Remove from localStorage completely
      localStorage.removeItem('authToken');
      
      // Set expiration timer
      this.setTokenExpiration();
      
    } catch (error) {
      console.error('Failed to store token securely:', error);
      throw new Error('Token storage failed');
    }
  }

  // Retrieve token securely
  async getToken() {
    try {
      // Try sessionStorage first
      const sessionToken = sessionStorage.getItem('_auth');
      if (sessionToken) {
        const decrypted = await this.decrypt(sessionToken);
        if (decrypted && this.isTokenValid(decrypted)) {
          return decrypted;
        }
      }

      // Try cookie fallback
      const cookieToken = this.getTokenFromCookie();
      if (cookieToken) {
        const decrypted = await this.decrypt(cookieToken);
        if (decrypted && this.isTokenValid(decrypted)) {
          return decrypted;
        }
      }

      // Clean up invalid tokens
      this.removeToken();
      return null;
    } catch (error) {
      console.warn('Token retrieval failed:', error);
      this.removeToken();
      return null;
    }
  }

  // Get token from cookie
  getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_session') {
        return value;
      }
    }
    return null;
  }

  // Validate token format and expiration
  isTokenValid(token) {
    if (!token || typeof token !== 'string') return false;
    
    try {
      // Basic JWT format check
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp && payload.exp > now;
    } catch {
      return false;
    }
  }

  // Remove token from all storage locations
  removeToken() {
    // Clear sessionStorage
    sessionStorage.removeItem('_auth');
    sessionStorage.removeItem('_tk');
    
    // Clear cookies
    document.cookie = 'auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Clear old localStorage entries
    localStorage.removeItem('authToken');
    
    // Clear expiration timer
    this.clearTokenExpiration();
  }

  // Set automatic token expiration
  setTokenExpiration() {
    this.clearTokenExpiration();
    
    // Auto-logout after 24 hours
    this.expirationTimer = setTimeout(() => {
      this.removeToken();
      window.dispatchEvent(new CustomEvent('tokenExpired'));
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  // Clear expiration timer
  clearTokenExpiration() {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }

  // Check if secure storage is available
  isSecureStorageAvailable() {
    return window.isSecureContext && 
           typeof crypto !== 'undefined' && 
           crypto.subtle !== undefined;
  }

  // Security audit
  getSecurityStatus() {
    return {
      secureContext: window.isSecureContext,
      cryptoAvailable: typeof crypto !== 'undefined',
      encryptionEnabled: this.encryptionKey !== null,
      storageMethod: this.encryptionKey ? 'encrypted' : 'base64-fallback',
      tokenPresent: !!sessionStorage.getItem('_auth'),
      httpsEnabled: location.protocol === 'https:'
    };
  }
}

// Export singleton instance
export const secureTokenStorage = new SecureTokenStorage();
export default secureTokenStorage;