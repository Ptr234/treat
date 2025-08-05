import React, { memo, useState, useCallback } from 'react'

const OptimizedLogo = memo(({ 
  size = 'w-10 h-10', 
  className = '', 
  showFallback = true,
  alt = 'OneStopCentre Uganda',
  rounded = 'rounded-xl'
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  return (
    <div className={`relative ${size} ${rounded} overflow-hidden shadow-lg bg-gradient-to-br from-yellow-400 to-red-500 ${className}`}>
      {!imageError ? (
        <img 
          src="/images/oneStopCenter-logo.jpeg" 
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      ) : null}
      
      {/* Fallback display */}
      {(imageError || !imageLoaded) && showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-red-500 text-white font-bold text-sm">
          OSC
        </div>
      )}
      
      {/* Loading shimmer effect */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
    </div>
  )
})

OptimizedLogo.displayName = 'OptimizedLogo'

export default OptimizedLogo