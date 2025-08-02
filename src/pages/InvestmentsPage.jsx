import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import Investments from '../components/Investments'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'

const InvestmentsPage = () => {
  const location = useLocation()
  const [initialCategory, setInitialCategory] = useState('All')
  const [initialSearch, setInitialSearch] = useState('')
  
  // Handle URL parameters for sector filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const sector = urlParams.get('sector')
    const search = urlParams.get('search')
    
    if (sector) {
      // Map URL sectors to actual investment categories
      const sectorMapping = {
        'agriculture': 'Agriculture & Agribusiness',
        'tourism': 'Tourism & Hospitality',
        'mining': 'Mining & Minerals',
        'ict': 'ICT & Technology',
        'manufacturing': 'Manufacturing & Industrial',
        'energy': 'Energy & Infrastructure'
      }
      
      const categoryName = sectorMapping[sector.toLowerCase()]
      if (categoryName) {
        setInitialCategory(categoryName)
      }
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
    <PageBackground page="investments">
      <PageTransition>
        <div className="relative">
          <div className="pt-24">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <Breadcrumb />
            </div>
            
            <Investments initialCategory={initialCategory} initialSearch={initialSearch} />
          </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default InvestmentsPage