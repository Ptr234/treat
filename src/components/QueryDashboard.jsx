import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const QueryDashboard = ({ queries = [], onUpdateQuery, onDeleteQuery }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const { addNotification } = useNotification()

  const queryStatuses = ['All', 'Submitted', 'In Progress', 'Under Review', 'Waiting for Info', 'Resolved', 'Closed']

  const filteredQueries = useMemo(() => {
    let filtered = queries

    if (statusFilter && statusFilter !== 'All') {
      filtered = filtered.filter(query => query.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(query =>
        query.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.queryType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.id.toString().includes(searchTerm)
      )
    }

    return filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  }, [queries, statusFilter, searchTerm])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'Under Review':
        return 'bg-purple-100 text-purple-800'
      case 'Waiting for Info':
        return 'bg-orange-100 text-orange-800'
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      case 'Closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'Low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleStatusUpdate = useCallback((queryId, newStatus) => {
    if (onUpdateQuery) {
      onUpdateQuery(queryId, { status: newStatus, updatedAt: new Date().toISOString() })
      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Query status updated to: ${newStatus}`,
        duration: 3000
      })
    }
  }, [onUpdateQuery, addNotification])

  const handleDeleteQuery = useCallback((queryId) => {
    if (onDeleteQuery) {
      onDeleteQuery(queryId)
      setShowDetails(false)
      setSelectedQuery(null)
      addNotification({
        type: 'info',
        title: 'Query Deleted',
        message: 'Query has been removed from the system',
        duration: 3000
      })
    }
  }, [onDeleteQuery, addNotification])

  const getQueryStats = () => {
    const stats = {
      total: queries.length,
      submitted: queries.filter(q => q.status === 'Submitted').length,
      inProgress: queries.filter(q => q.status === 'In Progress').length,
      resolved: queries.filter(q => q.status === 'Resolved').length,
      avgResponseTime: '2.3 hours' // This would be calculated from actual data
    }
    return stats
  }

  const stats = getQueryStats()

  return (
    <section className="py-20 px-4 relative">
      {/* Uganda Government Administration Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img 
            src="/images/uganda-business-bg.jpeg" 
            alt="Uganda government administration and service centers" 
            className="w-full h-full object-cover opacity-5"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/95 via-gray-50/90 to-blue-100/95"></div>
        
        {/* Uganda Administrative Symbols */}
        <div className="absolute top-10 left-10 opacity-15">
          <img 
            src="/images/uganda-coat-of-arms.png" 
            alt="Uganda Coat of Arms" 
            className="w-20 h-20 object-contain"
          />
        </div>
        
        <div className="absolute top-10 right-10 opacity-20">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda flag" 
            className="w-24 h-16 object-cover rounded shadow-md"
          />
        </div>
        
        {/* National Service Pattern */}
        <div className="absolute bottom-20 right-10 opacity-10">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 rounded-full"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/images/uganda-flag.png" 
              alt="Uganda flag" 
              className="w-8 h-6 object-cover mr-3 rounded shadow-md"
            />
            <span className="inline-block px-4 py-2 bg-purple-500/30 text-purple-800 rounded-full text-sm font-medium border border-purple-400/30">
              📊 Official Uganda Government Query Management Dashboard
            </span>
            <img 
              src="/images/uganda-coat-of-arms.png" 
              alt="Uganda Coat of Arms" 
              className="w-8 h-8 object-contain ml-3 opacity-80"
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Uganda Government Support Query
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Management Dashboard
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Official administrative dashboard for managing citizen and investor support queries across Uganda's government agencies. 
            Track, manage, and respond to queries efficiently while monitoring response times and satisfaction metrics for the Pearl of Africa.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Queries</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.submitted}</div>
            <div className="text-sm text-gray-600">New Submissions</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.avgResponseTime}</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Query Management</h3>
            <div className="flex items-center text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {filteredQueries.length} queries found
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <input
                type="text"
                placeholder="Search by name, type, ID, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            >
              {queryStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Queries List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredQueries.length > 0 ? (
            filteredQueries.map((query, index) => (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => {
                  setSelectedQuery(query)
                  setShowDetails(true)
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {query.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {query.fullName || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Query #{query.id} • {new Date(query.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(query.status)}`}>
                      {query.status}
                    </span>
                    {query.priority && (
                      <span className={`text-sm font-medium ${getPriorityColor(query.priority)}`}>
                        {query.priority} Priority
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Query Type:</span>
                    <p className="font-medium text-gray-900">{query.queryType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Agency:</span>
                    <p className="font-medium text-gray-900">{query.agency || 'General'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Contact:</span>
                    <p className="font-medium text-gray-900">{query.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm text-gray-500">Query Details:</span>
                  <p className="text-gray-700 line-clamp-2 mt-1">{query.details}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {query.phone && (
                      <span>📞 {query.phone}</span>
                    )}
                    <span>📧 {query.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={query.status}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleStatusUpdate(query.id, e.target.value)
                      }}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {queryStatuses.slice(1).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedQuery(query)
                        setShowDetails(true)
                      }}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No queries found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>

        {/* Query Details Modal */}
        {showDetails && selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Query Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Query ID</label>
                    <p className="text-gray-900 font-mono">#{selectedQuery.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedQuery.status)}`}>
                      {selectedQuery.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                    <p className="text-gray-900">{new Date(selectedQuery.submittedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <p className="text-gray-900">
                      {selectedQuery.updatedAt 
                        ? new Date(selectedQuery.updatedAt).toLocaleString()
                        : 'Not updated'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900">{selectedQuery.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedQuery.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedQuery.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Query Type</label>
                    <p className="text-gray-900">{selectedQuery.queryType}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Agency</label>
                  <p className="text-gray-900">{selectedQuery.agency || 'General Inquiry'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Query Details</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedQuery.details}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <select
                    value={selectedQuery.status}
                    onChange={(e) => handleStatusUpdate(selectedQuery.id, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {queryStatuses.slice(1).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(`Re: Query #${selectedQuery.id} - ${selectedQuery.queryType}`)
                      const body = encodeURIComponent(`Dear ${selectedQuery.fullName},\n\nThank you for your query regarding ${selectedQuery.queryType}.\n\n[Your response here]\n\nBest regards,\nOneStopCentre Uganda Support Team`)
                      window.open(`mailto:${selectedQuery.email}?subject=${subject}&body=${body}`, '_blank')
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Reply via Email
                  </button>
                  <button
                    onClick={() => handleDeleteQuery(selectedQuery.id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete Query
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}

export default QueryDashboard