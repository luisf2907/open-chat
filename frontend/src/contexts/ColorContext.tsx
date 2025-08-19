import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface ColorContextType {
  primaryColor: string
  setPrimaryColor: (color: string) => void
  resetToDefault: () => void
}

const ColorContext = createContext<ColorContextType | undefined>(undefined)

const DEFAULT_COLOR = '#3b82f6' // blue-500

// Convert hex to RGB values
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Generate color palette from a base color
function generatePalette(baseColor: string) {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return null

  // Generate lighter and darker variants
  const palette: Record<string, string> = {}
  
  // 50 - very light
  palette['50'] = `${Math.min(255, rgb.r + 40)} ${Math.min(255, rgb.g + 40)} ${Math.min(255, rgb.b + 40)}`
  
  // 100 - lighter
  palette['100'] = `${Math.min(255, rgb.r + 30)} ${Math.min(255, rgb.g + 30)} ${Math.min(255, rgb.b + 30)}`
  
  // 200 - light
  palette['200'] = `${Math.min(255, rgb.r + 20)} ${Math.min(255, rgb.g + 20)} ${Math.min(255, rgb.b + 20)}`
  
  // 300 - light medium
  palette['300'] = `${Math.min(255, rgb.r + 10)} ${Math.min(255, rgb.g + 10)} ${Math.min(255, rgb.b + 10)}`
  
  // 400 - medium light
  palette['400'] = `${Math.max(0, rgb.r - 5)} ${Math.max(0, rgb.g - 5)} ${Math.max(0, rgb.b - 5)}`
  
  // 500 - base (original)
  palette['500'] = `${rgb.r} ${rgb.g} ${rgb.b}`
  
  // 600 - medium dark
  palette['600'] = `${Math.max(0, rgb.r - 20)} ${Math.max(0, rgb.g - 20)} ${Math.max(0, rgb.b - 20)}`
  
  // 700 - dark
  palette['700'] = `${Math.max(0, rgb.r - 35)} ${Math.max(0, rgb.g - 35)} ${Math.max(0, rgb.b - 35)}`
  
  // 800 - darker
  palette['800'] = `${Math.max(0, rgb.r - 50)} ${Math.max(0, rgb.g - 50)} ${Math.max(0, rgb.b - 50)}`
  
  // 900 - very dark
  palette['900'] = `${Math.max(0, rgb.r - 65)} ${Math.max(0, rgb.g - 65)} ${Math.max(0, rgb.b - 65)}`
  
  return palette
}

// Apply color palette to CSS custom properties
function applyColorPalette(color: string) {
  const palette = generatePalette(color)
  if (!palette) return

  const root = document.documentElement
  Object.entries(palette).forEach(([shade, rgb]) => {
    root.style.setProperty(`--primary-${shade}`, rgb)
  })
}

interface ColorProviderProps {
  children: ReactNode
}

export function ColorProvider({ children }: ColorProviderProps) {
  const [primaryColor, setPrimaryColorState] = useState(() => {
    const saved = localStorage.getItem('primaryColor')
    return saved || DEFAULT_COLOR
  })

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color)
    localStorage.setItem('primaryColor', color)
    applyColorPalette(color)
  }

  const resetToDefault = () => {
    setPrimaryColor(DEFAULT_COLOR)
  }

  useEffect(() => {
    // Apply saved color on mount
    applyColorPalette(primaryColor)
  }, [])

  return (
    <ColorContext.Provider value={{ primaryColor, setPrimaryColor, resetToDefault }}>
      {children}
    </ColorContext.Provider>
  )
}

export function useColor() {
  const context = useContext(ColorContext)
  if (context === undefined) {
    throw new Error('useColor must be used within a ColorProvider')
  }
  return context
}
