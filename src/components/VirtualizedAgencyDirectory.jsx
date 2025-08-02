// Virtualized Agency Directory for Enhanced Performance
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import InfiniteLoader from 'react-window-infinite-loader'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useEnhancedKeyboardNavigation } from '../hooks/useEnhancedKeyboardNavigation'
import { useVirtualization } from '../hooks/useVirtualization'

const VirtualizedAgencyDirectory = ({ 
  agencies = [], 
  loading = false, 
  hasNextPage = false, 
  loadMore = () => {},
  onAgencySelect = () => {},
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('card')
  const listRef = useRef(null)
  const searchInputRef = useRef(null)

  // Enhanced keyboard navigation
  const {
    containerRef,
    focusFirst,
    focusNext,
    focusPrevious,
    announceToScreenReader
  } = useEnhancedKeyboardNavigation({
    enabled: true,
    arrowNavigation: true,
    announceChanges: true
  })

  // Virtualization optimization
  const { getItemSize, overscanCount } = useVirtualization({
    itemHeight: viewMode === 'card' ? 180 : 60,
    containerHeight: 600,
    totalItems: agencies.length
  })

  // Filter and sort agencies
  const filteredAgencies = useMemo(() => {
    let filtered = agencies.filter(agency => {
      const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agency.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agency.services?.some(service => 
                             service.toLowerCase().includes(searchTerm.toLowerCase())
                           )
      
      const matchesCategory = selectedCategory === 'all' || 
                             agency.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    // Sort agencies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'established':
          return new Date(b.established) - new Date(a.established)
        case 'popularity':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [agencies, searchTerm, selectedCategory, sortBy])

  // Categories for filtering
  const categories = useMemo(() => {
    const cats = [...new Set(agencies.map(agency => agency.category))].sort()
    return [{ value: 'all', label: 'All Categories' }, ...cats.map(cat => ({ value: cat, label: cat }))]
  }, [agencies])

  // Infinite loading logic
  const isItemLoaded = useCallback((index) => {
    return !!filteredAgencies[index]
  }, [filteredAgencies])

  const loadMoreItems = useCallback(async (startIndex, stopIndex) => {
    if (hasNextPage && !loading) {
      await loadMore(startIndex, stopIndex)
    }
  }, [hasNextPage, loading, loadMore])

  // Agency item renderer
  const AgencyItem = ({ index, style }) => {
    const agency = filteredAgencies[index]
    
    if (!agency) {
      return (
        <div style={style} className="flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 rounded-lg h-32 w-full mx-4"></div>
        </div>
      )
    }

    const handleAgencyClick = () => {
      onAgencySelect(agency)
      announceToScreenReader(`Selected ${agency.name}`)
    }

    const handleAgencyKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleAgencyClick()
      }
    }

    if (viewMode === 'list') {
      return (
        <div style={style} className="px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={handleAgencyClick}
            onKeyDown={handleAgencyKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${agency.name}`}
          >
            <div className="flex-shrink-0">
              {agency.logo ? (
                <img 
                  src={agency.logo} 
                  alt={`${agency.name} logo`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-red-600" />
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {agency.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {agency.category}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400">
              {agency.phone && <PhoneIcon className="w-4 h-4" />}
              {agency.email && <EnvelopeIcon className="w-4 h-4" />}
              {agency.website && <GlobeAltIcon className="w-4 h-4" />}
            </div>
          </motion.div>
        </div>
      )
    }

    return (
      <div style={style} className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={handleAgencyClick}
          onKeyDown={handleAgencyKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`View details for ${agency.name}`}
        >
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {agency.logo ? (
                  <img 
                    src={agency.logo} 
                    alt={`${agency.name} logo`}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {agency.name}
                </h3>
                <p className="text-sm text-red-600 font-medium mb-2">
                  {agency.category}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {agency.description}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {agency.phone && (
                  <div className="flex items-center space-x-1">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{agency.phone}</span>
                  </div>
                )}
                {agency.email && (
                  <div className="flex items-center space-x-1">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{agency.email}</span>
                  </div>
                )}
              </div>
              
              {agency.rating && (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(agency.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({agency.rating})</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'f':
            event.preventDefault()
            searchInputRef.current?.focus()
            break
          case 'k':
            event.preventDefault()
            focusFirst()
            break
          default:
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusFirst])

  return (
    <div className={`virtualized-agency-directory ${className}`} ref={containerRef}>
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search agencies, services, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
              aria-label="Search agencies"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            aria-label="Filter by category"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            aria-label="Sort agencies"
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="established">Sort by Date</option>
            <option value="popularity">Sort by Rating</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'card'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-label="Card view"
              aria-pressed={viewMode === 'card'}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              List
            </button>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAgencies.length} of {agencies.length} agencies
          </span>
          <span className="text-xs">
            Press Ctrl+F to search, Ctrl+K to focus list
          </span>
        </div>
      </div>

      {/* Virtualized List */}
      <div className="bg-gray-50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <AutoSizer>
          {({ height, width }) => (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={hasNextPage ? filteredAgencies.length + 1 : filteredAgencies.length}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <List
                  ref={(list) => {
                    ref(list)
                    listRef.current = list
                  }}
                  height={height}
                  width={width}
                  itemCount={filteredAgencies.length}
                  itemSize={getItemSize()}
                  onItemsRendered={onItemsRendered}
                  overscanCount={overscanCount}
                  itemData={filteredAgencies}
                >
                  {AgencyItem}
                </List>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>

      {/* Loading indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-8"
          >
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              <span>Loading more agencies...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {filteredAgencies.length} agencies found
      </div>
    </div>
  )
}

export default VirtualizedAgencyDirectory