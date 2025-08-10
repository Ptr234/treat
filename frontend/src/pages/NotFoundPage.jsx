import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { PageBackground } from '../utils/backgroundSystem.jsx'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [errorDetails, setErrorDetails] = useState(null)
  
  useEffect(() => {
    // Check for error details in location state or URL params
    const urlParams = new URLSearchParams(location.search)
    if (urlParams.get('error_id') || location.state?.error) {
      setErrorDetails({
        errorId: urlParams.get('error_id') || 'Unknown',
        timestamp: urlParams.get('timestamp') || new Date().toLocaleString(),
        path: location.pathname,
        referrer: document.referrer || 'Direct access',
        userAgent: navigator.userAgent,
        ...location.state?.error
      })
    }
  }, [location])

  const goBack = () => {
    try {
      // Clear any error state before navigation
      if (window.history.length > 1) {
        navigate(-1)
      } else {
        navigate('/')
      }
    } catch (error) {
      // Navigation error handling removed for production
      window.location.href = '/'
    }
  }

  const refreshPage = () => {
    try {
      window.location.reload()
    } catch (error) {
      window.location.href = '/'
    }
  }

  const clearCacheAndReload = () => {
    try {
      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear cache if supported
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name))
        }).finally(() => {
          window.location.href = '/'
        })
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      window.location.href = '/'
    }
  }
  
  return (
    <PageBackground page="home">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="text-6xl mb-6">{errorDetails ? '❌' : '🔍'}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {errorDetails ? 'Application Error' : 'Page Not Found'}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {errorDetails 
                ? 'We encountered an error while processing your request. This might be a temporary issue.'
                : 'The page you\'re looking for doesn\'t exist or has been moved.'
              }
            </p>

            {errorDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <div className="text-sm text-red-700 space-y-1">
                  <p><strong>Error ID:</strong> {errorDetails.errorId}</p>
                  <p><strong>Time:</strong> {errorDetails.timestamp}</p>
                  <p><strong>Path:</strong> {errorDetails.path}</p>
                  {errorDetails.referrer && <p><strong>Referrer:</strong> {errorDetails.referrer}</p>}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {errorDetails ? (
                <>
                  <button
                    onClick={refreshPage}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Page
                  </button>
                  <button
                    onClick={clearCacheAndReload}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Cache & Reset
                  </button>
                </>
              ) : (
                <button
                  onClick={goBack}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </button>
              )}
              <Link
                to="/"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Return Home
              </Link>
              <Link
                to="/investments"
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                View Investments
              </Link>
              <Link
                to="/services"
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Browse Services
              </Link>
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

export default NotFoundPage