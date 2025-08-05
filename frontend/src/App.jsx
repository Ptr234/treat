import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Footer from './components/Footer'
import ProfessionalNotificationSystem from './components/ProfessionalNotificationSystem'
import MobileNavigation from './components/MobileNavigation'
import LoadingScreen from './components/LoadingScreen'
import FloatingActionButtons from './components/FloatingActionButtons'
import InvoiceGeneratorButton from './components/InvoiceGeneratorButton'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import NavigationErrorHandler from './components/NavigationErrorHandler'
import backgroundCacheManager from './utils/backgroundCacheManager'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { MobileProvider } from './contexts/MobileContext'
import './App.css'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const AgenciesPage = lazy(() => import('./pages/AgenciesPage'))
const ToolsPage = lazy(() => import('./pages/ToolsPage'))
const TaxCalculatorPage = lazy(() => import('./pages/TaxCalculatorPage'))
const ROICalculatorPage = lazy(() => import('./pages/ROICalculatorPage'))
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const InvoicePage = lazy(() => import('./pages/InvoicePage'))
const DocumentChecklistPage = lazy(() => import('./pages/DocumentChecklistPage'))
const BusinessRegistrationPage = lazy(() => import('./pages/BusinessRegistrationPage'))
const InvestmentOnboardingPage = lazy(() => import('./pages/InvestmentOnboardingPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Lazy load modals
const ChecklistModal = lazy(() => import('./components/ChecklistModal'))
const FeedbackForm = lazy(() => import('./components/FeedbackForm'))


const App = () => {
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false)
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false)

  useEffect(() => {
    // Initialize background cache manager
    backgroundCacheManager.init?.() // Safe call in case init is already called
  }, [])

  // Secure modal handlers using custom events instead of global window pollution
  const openChecklistModal = useCallback(() => {
    setIsChecklistModalOpen(true)
  }, [])
  
  const openFeedbackForm = useCallback(() => {
    setIsFeedbackFormOpen(true)
  }, [])

  useEffect(() => {
    const handleOpenChecklist = () => openChecklistModal()
    const handleOpenFeedback = () => openFeedbackForm()
    
    document.addEventListener('openChecklistModal', handleOpenChecklist)
    document.addEventListener('openFeedbackForm', handleOpenFeedback)
    
    return () => {
      document.removeEventListener('openChecklistModal', handleOpenChecklist)
      document.removeEventListener('openFeedbackForm', handleOpenFeedback)
    }
  }, [openChecklistModal, openFeedbackForm])

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ThemeProvider>
          <MobileProvider>
            <Router>
              <NavigationErrorHandler>
                <div className="min-h-screen relative overflow-x-hidden">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                  >
                      <Header />
                      <MobileNavigation />
                      
                      <main className="relative overflow-hidden">
                        <Suspense fallback={<LoadingScreen />}>
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/investments" element={<InvestmentsPage />} />
                            <Route path="/services" element={<ServicesPage />} />
                            <Route path="/agencies" element={<AgenciesPage />} />
                            <Route path="/tools" element={<ToolsPage />} />
                            <Route path="/calculator" element={<TaxCalculatorPage />} />
                            <Route path="/roi-calculator" element={<ROICalculatorPage />} />
                            <Route path="/downloads" element={<DownloadsPage />} />
                            <Route path="/support" element={<SupportPage />} />
                            <Route path="/invoice" element={<InvoicePage />} />
                            <Route path="/document-checklist" element={<DocumentChecklistPage />} />
                            <Route path="/registration-wizard" element={<BusinessRegistrationPage />} />
                            <Route path="/investment-onboarding" element={<InvestmentOnboardingPage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                        </Suspense>
                      </main>
                      
                      <Footer />
                    </motion.div>
                </AnimatePresence>

                <ProfessionalNotificationSystem />
                <Suspense fallback={null}>
                  {isChecklistModalOpen && (
                    <ChecklistModal 
                      isOpen={isChecklistModalOpen} 
                      onClose={() => setIsChecklistModalOpen(false)} 
                    />
                  )}
                  {isFeedbackFormOpen && (
                    <FeedbackForm 
                      isOpen={isFeedbackFormOpen} 
                      onClose={() => setIsFeedbackFormOpen(false)} 
                    />
                  )}
                </Suspense>
                <ScrollToTop />
                <FloatingActionButtons />
                <InvoiceGeneratorButton />
                </div>
              </NavigationErrorHandler>
            </Router>
          </MobileProvider>
        </ThemeProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App