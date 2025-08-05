import React from 'react'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import DocumentChecklist from '../components/DocumentChecklist'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'

const DocumentChecklistPage = () => {
  return (
    <PageBackground page="document-checklist">
      <PageTransition>
        <div className="relative">
          <div className="pt-24">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <Breadcrumb />
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm">
              <DocumentChecklist />
            </div>
          </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default DocumentChecklistPage