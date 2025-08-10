import React, { Component } from 'react'
import { networkErrorHandler } from '../utils/networkErrorHandler'
import { errorManager } from '../utils/errorHandling'

class GlobalErrorCatcher extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using our error management system
    errorManager.logError({
      type: 'REACT_ERROR_BOUNDARY',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    }, 'REACT')

    this.setState({ errorInfo: { error, errorInfo } })

    // Show user-friendly error message
    networkErrorHandler.showSafeErrorMessage(
      'The application encountered an unexpected error. We\'re working to fix this.',
      'error'
    )
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorInfo: null })
    // Optionally reload the page for a fresh start
    if (this.state.errorInfo?.error?.stack?.includes('ChunkLoadError')) {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-8">
              We've encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Go Home
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full text-gray-500 py-2 px-4 text-sm hover:text-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details
                </summary>
                <pre className="mt-4 text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-40">
                  {this.state.errorInfo.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorCatcher