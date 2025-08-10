import React, { useState, useCallback, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const DocumentUpload = ({ onUpload, allowedTypes = [], maxSize = 10, multiple = true, required = false }) => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { addNotification } = useNotification()
  const fileInputRef = useRef(null)

  const allowedTypesMap = useMemo(() => ({
    'pdf': { ext: '.pdf', mime: 'application/pdf', icon: '📄' },
    'doc': { ext: '.doc,.docx', mime: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: '📝' },
    'image': { ext: '.jpg,.jpeg,.png,.gif', mime: 'image/*', icon: '🖼️' },
    'excel': { ext: '.xls,.xlsx', mime: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', icon: '📊' },
    'zip': { ext: '.zip,.rar', mime: 'application/zip,application/x-rar-compressed', icon: '🗜️' }
  }), [])

  const getAcceptedFormats = () => {
    if (allowedTypes.length === 0) return '*'
    return allowedTypes.map(type => allowedTypesMap[type]?.ext || type).join(',')
  }

  const validateFile = useCallback((file) => {
    // Check file size (maxSize in MB)
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type if restrictions exist
    if (allowedTypes.length > 0) {
      const fileExtension = `.${  file.name.split('.').pop().toLowerCase()}`
      const isAllowed = allowedTypes.some(type => {
        const typeConfig = allowedTypesMap[type]
        return typeConfig && typeConfig.ext.includes(fileExtension)
      })
      
      if (!isAllowed) {
        return `File type not allowed. Accepted types: ${allowedTypes.join(', ')}`
      }
    }

    return null
  }, [allowedTypes, maxSize, allowedTypesMap])

  const processFiles = useCallback((files) => {
    const fileArray = Array.from(files)
    const validFiles = []
    const errors = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        // Create file object with metadata
        const fileData = {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 0,
          status: 'pending' // pending, uploading, success, error
        }
        validFiles.push(fileData)
      }
    })

    // Show errors if any
    if (errors.length > 0) {
      addNotification({
        type: 'error',
        title: 'File Validation Error',
        message: errors.join('; '),
        duration: 5000
      })
    }

    // Add valid files
    if (validFiles.length > 0) {
      setUploadedFiles(prev => {
        const newFiles = multiple ? [...prev, ...validFiles] : validFiles
        return newFiles
      })

      // Simulate upload process
      simulateUpload(validFiles)
    }
  }, [multiple, addNotification, simulateUpload, validateFile])

  const simulateUpload = useCallback(async (files) => {
    setIsUploading(true)

    for (const fileData of files) {
      // Update file status to uploading
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { ...f, status: 'uploading' } : f)
      )

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileData.id ? { ...f, uploadProgress: progress } : f)
        )
      }

      // Mark as completed
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { ...f, status: 'success', uploadProgress: 100 } : f)
      )
    }

    setIsUploading(false)

    // Notify parent component
    if (onUpload) {
      onUpload(files.map(f => f.file))
    }

    addNotification({
      type: 'success',
      title: 'Upload Complete',
      message: `${files.length} file(s) uploaded successfully`,
      duration: 3000
    })
  }, [onUpload, addNotification])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files
    if (files.length > 0) {
      processFiles(files)
    }
    // Reset input value to allow same file upload again
    e.target.value = ''
  }, [processFiles])

  const removeFile = useCallback((fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    addNotification({
      type: 'info',
      title: 'File Removed',
      message: 'File has been removed from upload queue',
      duration: 2000
    })
  }, [addNotification])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    
    if (['pdf'].includes(extension)) return '📄'
    if (['doc', 'docx'].includes(extension)) return '📝'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return '🖼️'
    if (['xls', 'xlsx'].includes(extension)) return '📊'
    if (['zip', 'rar'].includes(extension)) return '🗜️'
    if (['txt'].includes(extension)) return '📄'
    return '📎'
  }

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={getAcceptedFormats()}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="text-4xl">
            {isDragging ? '⬇️' : '📤'}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragging ? 'Drop your files here' : 'Upload Documents'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your files here, or click to browse
            </p>
            
            {allowedTypes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Accepted file types:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {allowedTypes.map(type => (
                    <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <span className="mr-1">{allowedTypesMap[type]?.icon || '📎'}</span>
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-400">
              Maximum file size: {maxSize}MB {multiple && '• Multiple files allowed'}
              {required && ' • Required'}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            Choose Files
          </motion.button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-3">
            {uploadedFiles.map((fileData) => (
              <motion.div
                key={fileData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-2xl flex-shrink-0">
                    {getFileIcon(fileData.name)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileData.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileData.size)}
                    </p>
                    
                    {fileData.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{fileData.uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${fileData.uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {fileData.status === 'success' && (
                    <div className="text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {fileData.status === 'error' && (
                    <div className="text-red-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">Uploading files...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentUpload