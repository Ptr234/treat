import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const BackgroundTheme = () => {
  const { theme } = useTheme()

  return (
    <div 
      className="fixed inset-0 z-0"
      style={{
        background: theme.background,
        backgroundSize: theme.backgroundSize || 'cover',
        backgroundPosition: theme.backgroundPosition || 'center',
        backgroundAttachment: 'fixed'
      }}
    />
  )
}

export default BackgroundTheme