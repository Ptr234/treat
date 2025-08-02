import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import Services from '../components/Services'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'

const ServicesPage = () => {
  const location = useLocation()
  const [initialCategory, setInitialCategory] = useState('All')
  const [initialSearch, setInitialSearch] = useState('')
  
  // Handle URL parameters for category filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category')
    const search = urlParams.get('search')
    
    if (category) {
      // Use the category directly as it should match the SERVICE_CATEGORIES
      setInitialCategory(decodeURIComponent(category))
    } else {
      setInitialCategory('All')
    }
    
    if (search) {
      setInitialSearch(decodeURIComponent(search))
    } else {
      setInitialSearch('')
    }
  }, [location])

  return (
    <PageBackground page="services">
      <PageTransition>
        <div className="relative">
          <div className="pt-24">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <Breadcrumb />
            </div>
            
            <Services initialCategory={initialCategory} initialSearch={initialSearch} />
          </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default ServicesPage