/**
 * Secure DOM Utilities
 * Safe alternatives to innerHTML and other potentially dangerous DOM operations
 */

// XSS Prevention: Sanitize HTML content
export function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Safe alternative to innerHTML
export function setElementContent(element, content) {
  if (!element || !content) return;
  
  // Clear existing content
  element.textContent = '';
  
  if (typeof content === 'string') {
    element.textContent = content;
  } else if (content instanceof Node) {
    element.appendChild(content);
  } else if (Array.isArray(content)) {
    content.forEach(item => {
      if (item instanceof Node) {
        element.appendChild(item);
      } else if (typeof item === 'string') {
        const textNode = document.createTextNode(item);
        element.appendChild(textNode);
      }
    });
  }
}

// Create element with safe attributes
export function createElement(tagName, attributes = {}, content = '') {
  const element = document.createElement(tagName);
  
  // Set safe attributes
  Object.keys(attributes).forEach(key => {
    if (key === 'className') {
      element.className = sanitizeHTML(attributes[key]);
    } else if (key === 'style') {
      // Only allow safe CSS properties
      const safeCSSProps = ['color', 'background-color', 'font-size', 'margin', 'padding', 'border', 'display', 'position'];
      const styles = attributes[key];
      
      if (typeof styles === 'object') {
        Object.keys(styles).forEach(prop => {
          if (safeCSSProps.includes(prop)) {
            element.style[prop] = sanitizeHTML(styles[prop]);
          }
        });
      }
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, sanitizeHTML(attributes[key]));
    } else if (['id', 'role', 'aria-label', 'title'].includes(key)) {
      element.setAttribute(key, sanitizeHTML(attributes[key]));
    }
  });
  
  // Set content safely
  if (content) {
    setElementContent(element, content);
  }
  
  return element;
}

// Create secure notification
export function createNotification(message, type = 'info', duration = 5000) {
  const typeStyles = {
    success: { backgroundColor: '#10b981', color: 'white' },
    error: { backgroundColor: '#ef4444', color: 'white' },
    warning: { backgroundColor: '#f59e0b', color: 'white' },
    info: { backgroundColor: '#3b82f6', color: 'white' }
  };
  
  const style = typeStyles[type] || typeStyles.info;
  
  const notification = createElement('div', {
    className: 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm',
    style: {
      ...style,
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out'
    }
  });
  
  const content = createElement('div', {
    className: 'flex items-center space-x-2'
  });
  
  const icon = createElement('span', {}, getIconForType(type));
  const text = createElement('span', {}, sanitizeHTML(message));
  const closeBtn = createElement('button', {
    className: 'ml-auto text-white hover:text-gray-200',
    'aria-label': 'Close notification'
  }, '✕');
  
  closeBtn.onclick = () => notification.remove();
  
  content.appendChild(icon);
  content.appendChild(text);
  content.appendChild(closeBtn);
  notification.appendChild(content);
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, duration);
  
  return notification;
}

function getIconForType(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || icons.info;
}

// Secure event handler attachment
export function addSecureEventListener(element, event, handler, options = {}) {
  if (!element || typeof handler !== 'function') return;
  
  const secureHandler = (e) => {
    try {
      handler(e);
    } catch (error) {
      console.error('Event handler error:', error);
      // Don't expose error details to prevent information leakage
    }
  };
  
  element.addEventListener(event, secureHandler, options);
  
  return () => element.removeEventListener(event, secureHandler, options);
}

// Validate URL to prevent XSS via javascript: URLs
export function isSecureURL(url) {
  if (typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Safe redirect function
export function secureRedirect(url) {
  if (isSecureURL(url)) {
    window.location.href = url;
  } else {
    console.warn('Blocked potentially unsafe redirect to:', url);
  }
}

export default {
  sanitizeHTML,
  setElementContent,
  createElement,
  createNotification,
  addSecureEventListener,
  isSecureURL,
  secureRedirect
};