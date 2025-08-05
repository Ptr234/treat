// Background system for different pages with Uganda-focused high-quality images
export const BACKGROUNDS = {
  home: {
    image: '/images/uganda-map-flag.jpg',
    fallback: '/images/uganda-business-bg.jpeg',
    gradient: 'from-black/50 via-yellow-800/40 to-red-800/50',
    alt: 'Uganda map with flag - Republic of Uganda investment portal',
    theme: 'uganda-map'
  },
  investments: {
    image: '/images/Tourism.webp',
    fallback: '/images/lake-bunyonyi-uganda.jpg',
    gradient: 'from-black/45 via-green-800/30 to-blue-800/45',
    alt: 'Beautiful Uganda tourism landscapes - Investment opportunities in Pearl of Africa',
    theme: 'tourism-investment'
  },
  services: {
    image: '/images/Infrastucture.webp',
    fallback: '/images/uganda-business-bg.jpeg',
    gradient: 'from-black/55 via-blue-800/35 to-gray-800/50',
    alt: 'Uganda infrastructure development - Government services and business support',
    theme: 'infrastructure-services'
  },
  calculator: {
    image: '/images/uganda-kampala-city-view.webp',
    fallback: '/images/uganda-business-bg.jpeg',
    gradient: 'from-black/60 via-yellow-600/40 to-orange-700/60',
    alt: 'Modern Kampala city view - Tax calculator and financial services',
    theme: 'kampala-calculator'
  },
  downloads: {
    image: '/images/Pride.webp',
    fallback: '/images/uganda-pearl-africa.jpg',
    gradient: 'from-black/50 via-purple-800/35 to-red-800/50',
    alt: 'Uganda national pride and heritage - Official resources and documentation',
    theme: 'pride-resources'
  },
  search: {
    image: '/images/uganda-kampala-city-view.webp',
    fallback: '/images/uganda-business-bg.jpeg',
    gradient: 'from-black/55 via-indigo-800/40 to-purple-800/55',
    alt: 'Search Uganda business services and investment opportunities',
    theme: 'search-services'
  }
}

// Get background configuration for a page
export const getBackgroundForPage = (pageName) => {
  return BACKGROUNDS[pageName] || BACKGROUNDS.home
}

// Background component with enhanced visual effects
export const PageBackground = ({ page, children, className = '' }) => {
  const bg = getBackgroundForPage(page)
  
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Background Image with Fallback */}
      <div className="absolute inset-0">
        <img 
          src={bg.image}
          alt={bg.alt}
          className="w-full h-full object-cover opacity-100 transition-opacity duration-500"
          onError={(e) => {
            if (bg.fallback) {
              e.target.src = bg.fallback
            } else {
              e.target.style.display = 'none'
            }
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${bg.gradient}`}></div>
      </div>
      
      {/* Animated Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.6'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Ccircle cx='15' cy='15' r='0.5'/%3E%3Ccircle cx='45' cy='45' r='0.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'float 20s ease-in-out infinite'
        }} />
      </div>
      
      {/* Subtle Geometric Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.03) 49%, rgba(255,255,255,0.03) 51%, transparent 51%), linear-gradient(-45deg, transparent 49%, rgba(255,255,255,0.03) 49%, rgba(255,255,255,0.03) 51%, transparent 51%)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Content with Enhanced Readability */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Add floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          50% { transform: translateY(-20px) rotate(0deg); }
          75% { transform: translateY(-10px) rotate(-1deg); }
        }
      `}</style>
    </div>
  )
}

export default PageBackground