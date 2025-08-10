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
import GlobalErrorCatcher from './components/GlobalErrorCatcher'
import NavigationErrorHandler from './components/NavigationErrorHandler'
import NavigationGuide from './components/NavigationGuide'
import QuickActions from './components/QuickActions'
import ContextualHelp from './components/ContextualHelp'
import backgroundCacheManager from './utils/backgroundCacheManager'
import { networkErrorHandler } from './utils/networkErrorHandler'
import { errorManager } from './utils/errorHandling'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { MobileProvider } from './contexts/MobileContext'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

// Robust lazy loading with retry logic and chunk error handling
const lazyWithRetry = (importFunc, retries = 3) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptImport = (attempt) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            const isChunkError = error?.name === 'ChunkLoadError' || 
                                error?.message?.includes('Loading chunk') ||
                                error?.message?.includes('dynamically imported module') ||
                                error?.message?.includes('Failed to fetch');
            
            if (attempt < retries && isChunkError) {
              // Retry import attempt after delay
              setTimeout(() => attemptImport(attempt + 1), 1000 * attempt);
            } else if (isChunkError) {
              // Final fallback for chunk errors - reload the page
              // Force page reload as final fallback
              setTimeout(() => window.location.reload(), 1000);
              reject(error);
            } else {
              reject(error);
            }
          });
      };
      attemptImport(1);
    });
  });
};

// Lazy load pages with retry logic
const HomePage = lazyWithRetry(() => import('./pages/HomePage'))
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'))
const InvestmentsPage = lazyWithRetry(() => import('./pages/InvestmentsPage'))
const ServicesPage = lazyWithRetry(() => import('./pages/ServicesPage'))
const AgenciesPage = lazyWithRetry(() => import('./pages/AgenciesPage'))
const ToolsPage = lazyWithRetry(() => import('./pages/ToolsPage'))
const TaxCalculatorPage = lazyWithRetry(() => import('./pages/TaxCalculatorPage'))
const ROICalculatorPage = lazyWithRetry(() => import('./pages/ROICalculatorPage'))
const DownloadsPage = lazyWithRetry(() => import('./pages/DownloadsPage'))
const SupportPage = lazyWithRetry(() => import('./pages/SupportPage'))
const InvoicePage = lazyWithRetry(() => import('./pages/InvoicePage'))
const DocumentChecklistPage = lazyWithRetry(() => import('./pages/DocumentChecklistPage'))
const BusinessRegistrationPage = lazyWithRetry(() => import('./pages/BusinessRegistrationPage'))
const InvestmentOnboardingPage = lazyWithRetry(() => import('./pages/InvestmentOnboardingPage'))
const SearchPage = lazyWithRetry(() => import('./pages/SearchPage'))
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'))
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'))
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage'))

// Lazy load modals with retry logic
const ChecklistModal = lazyWithRetry(() => import('./components/ChecklistModal'))
const FeedbackForm = lazyWithRetry(() => import('./components/FeedbackForm'))


const App = () => {
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false)
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false)

  useEffect(() => {
    // Initialize error handling systems
    networkErrorHandler.preventNetworkErrors()
    errorManager.setUserContext({ app: 'Uganda Investment Portal' })
    
    // Initialize background cache manager
    backgroundCacheManager.init?.() // Safe call in case init is already called
    
    // Preload critical pages to prevent import failures
    const preloadCriticalPages = async () => {
      const result = await networkErrorHandler.safeExecute(async () => {
        // Preload most commonly accessed pages
        await Promise.allSettled([
          import('./pages/HomePage'),
          import('./pages/SupportPage'),
          import('./pages/AboutPage'),
          import('./pages/ServicesPage'),
        ]);
      }, null, 'preloading pages')
      
      if (!result.success) {
        console.warn('Page preloading failed, pages will load on demand')
      }
    };
    
    // Preload after a short delay to not block initial render
    setTimeout(preloadCriticalPages, 2000);
  }, [])

  // Secure modal handlers using custom events instead of global window pollution
  const openChecklistModal = useCallback(networkErrorHandler.wrapEventHandler(() => {
    setIsChecklistModalOpen(true)
  }, 'opening checklist modal'), [])
  
  const openFeedbackForm = useCallback(networkErrorHandler.wrapEventHandler(() => {
    setIsFeedbackFormOpen(true)
  }, 'opening feedback form'), [])

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
    <GlobalErrorCatcher>
      <ErrorBoundary>
        <NotificationProvider>
          <ThemeProvider>
            <MobileProvider>
              <AuthProvider>
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
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/admin" element={<AdminPage />} />
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
                <NavigationGuide />
                <QuickActions />
                <ContextualHelp />
                </div>
                </NavigationErrorHandler>
                </Router>
              </AuthProvider>
            </MobileProvider>
          </ThemeProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </GlobalErrorCatcher>
  )
}

export default App