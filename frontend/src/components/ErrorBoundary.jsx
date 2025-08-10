import React from 'react'
import { PageBackground } from '../utils/backgroundSystem.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging
    const errorDetails = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || 'anonymous'
    }
    
    // Error logging removed for production build
    
    // Development error details removed for production build
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorDetails)
    }
    
    this.setState({
      error,
      errorInfo
    })
  }

  reportError = async (errorDetails) => {
    try {
      // Replace with your error tracking service (Sentry, LogRocket, etc.)
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorDetails)
      // })
      // Error reporting log removed for production
    } catch (e) {
      // Error reporting failure log removed for production
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageBackground page="home">
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Something went wrong
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  We're sorry, but there was an unexpected error with this page. 
                  Our team has been notified and is working to fix it.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Return Home
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Try Again
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  <p className="mb-2">
                    <strong>Error ID:</strong> {Date.now()}
                  </p>
                  <p className="mb-2">
                    <strong>Time:</strong> {new Date().toLocaleString()}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-4 text-left">
                      <summary className="cursor-pointer text-red-600 font-medium">
                        Developer Details
                      </summary>
                      <div className="mt-2 p-4 bg-red-50 rounded-lg">
                        <p className="font-medium text-red-800 mb-2">Error:</p>
                        <pre className="text-xs text-red-700 mb-4 overflow-auto">
                          {this.state.error.toString()}
                        </pre>
                        <p className="font-medium text-red-800 mb-2">Stack:</p>
                        <pre className="text-xs text-red-700 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    Need help? Contact our support team:
                  </p>
                  <div className="flex justify-center space-x-6 text-sm">
                    <a href="tel:+256775692335" className="text-orange-600 hover:text-orange-700 font-medium">
                      📞 +256 775 692 335
                    </a>
                    <a href="mailto:support@onestopcentre.ug" className="text-orange-600 hover:text-orange-700 font-medium">
                      ✉️ support@onestopcentre.ug
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageBackground>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary