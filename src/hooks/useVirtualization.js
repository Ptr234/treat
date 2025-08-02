// Enhanced Virtualization Hook for Performance Optimization
import { useMemo, useCallback } from 'react'

export const useVirtualization = (options = {}) => {
  const {
    itemHeight = 100,
    containerHeight = 400,
    totalItems = 0
  } = options

  // Calculate optimal overscan count
  const overscanCount = useMemo(() => {
    const visibleItems = Math.ceil(containerHeight / itemHeight)
    return Math.max(2, Math.min(10, Math.ceil(visibleItems * 0.5)))
  }, [containerHeight, itemHeight])

  // Get item size (static)
  const getItemSize = useCallback(() => {
    return itemHeight
  }, [itemHeight])

  return {
    getItemSize,
    overscanCount
  }
}

export default useVirtualization