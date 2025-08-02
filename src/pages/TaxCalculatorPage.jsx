import React from 'react'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import Calculator from '../components/Calculator'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'

const TaxCalculatorPage = () => {
  return (
    <PageBackground page="calculator">
      <PageTransition>
        <div className="relative">
          <div className="pt-24">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <Breadcrumb />
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm">
              <Calculator />
            </div>
          </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default TaxCalculatorPage