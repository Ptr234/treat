import React from 'react'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import InvestmentOnboardingWizard from '../components/InvestmentOnboardingWizard'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'

const InvestmentOnboardingPage = () => {
  return (
    <PageBackground page="investment-onboarding">
      <PageTransition>
        <div className="relative">
          <div className="pt-24">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <Breadcrumb />
            </div>
            
            <div className="bg-black/10 backdrop-blur-sm">
              <InvestmentOnboardingWizard />
            </div>
          </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default InvestmentOnboardingPage