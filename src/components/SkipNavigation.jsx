// Enhanced Skip Navigation Component for WCAG 2.1 AA Compliance
import React from 'react'

const SkipNavigation = () => {
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#search', label: 'Skip to search' },
    { href: '#footer', label: 'Skip to footer' }
  ]

  return (
    <nav 
      className="skip-navigation" 
      aria-label="Skip navigation links"
      role="navigation"
    >
      {skipLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link"
          onFocus={(e) => {
            e.target.classList.add('focused')
          }}
          onBlur={(e) => {
            e.target.classList.remove('focused')
          }}
        >
          {link.label}
        </a>
      ))}
      
      <style jsx>{`
        .skip-navigation {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 9999;
        }
        
        .skip-link {
          position: absolute;
          top: -100px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 12px 16px;
          text-decoration: none;
          border-radius: 0 0 6px 6px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
          border: 2px solid transparent;
          white-space: nowrap;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .skip-link:focus,
        .skip-link.focused {
          top: 6px;
          border-color: #fbbf24;
          outline: 2px solid #fbbf24;
          outline-offset: 2px;
        }
        
        .skip-link:hover {
          background: #333;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .skip-link {
            background: #000;
            color: #fff;
            border: 2px solid #fff;
          }
          
          .skip-link:focus,
          .skip-link.focused {
            border-color: #fff;
            outline: 2px solid #fff;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .skip-link {
            transition: none;
          }
        }
      `}</style>
    </nav>
  )
}

export default SkipNavigation