// Notification Settings Panel - Professional Configuration
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const NotificationSettingsPanel = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings, 
    getNotificationStats, 
    showSuccess,
    clearAllNotifications,
    notificationHistory,
    addNotification
  } = useNotification()
  
  const [localSettings, setLocalSettings] = useState(settings)
  const stats = getNotificationStats()

  const handleSave = () => {
    updateSettings(localSettings)
    showSuccess('Settings Saved', 'Notification preferences updated successfully')
    onClose()
  }

  const handleTestNotification = (type) => {
    const testMessages = {
      success: { title: 'Success Test', message: 'This is a test success notification' },
      error: { title: 'Error Test', message: 'This is a test error notification' },
      warning: { title: 'Warning Test', message: 'This is a test warning notification' },
      info: { title: 'Info Test', message: 'This is a test info notification' }
    }
    
    const test = testMessages[type]
    addNotification({ type, title: test.title, message: test.message })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-red-500 text-black p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Notification Settings</h2>
                <p className="opacity-90">Customize your notification experience</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Statistics */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.unread}</div>
                  <div className="text-sm text-gray-600">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.byType?.error || 0}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              {/* Sound Settings */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Sound & Audio</h3>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                  />
                  <span>Enable notification sounds</span>
                </label>
              </div>

              {/* Display Settings */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Display</h3>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localSettings.animationsEnabled}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, animationsEnabled: e.target.checked }))}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                  />
                  <span>Enable animations</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Maximum notifications</label>
                  <select
                    value={localSettings.maxNotifications}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, maxNotifications: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Default duration (seconds)</label>
                  <select
                    value={localSettings.defaultDuration / 1000}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) * 1000 }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value={3}>3 seconds</option>
                    <option value={5}>5 seconds</option>
                    <option value={8}>8 seconds</option>
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <select
                    value={localSettings.position}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
              </div>

              {/* Test Notifications */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Test Notifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleTestNotification('success')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Success
                  </button>
                  <button
                    onClick={() => handleTestNotification('error')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Error
                  </button>
                  <button
                    onClick={() => handleTestNotification('warning')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Warning
                  </button>
                  <button
                    onClick={() => handleTestNotification('info')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Info
                  </button>
                </div>
              </div>

              {/* Management */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Management</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={clearAllNotifications}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Clear All Notifications
                  </button>
                  <button
                    onClick={() => {
                      setLocalSettings({
                        soundEnabled: true,
                        animationsEnabled: true,
                        maxNotifications: 4,
                        defaultDuration: 5000,
                        position: 'top-right',
                        theme: 'auto'
                      })
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default NotificationSettingsPanel