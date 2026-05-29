/**
 * ThemeProvider Component
 * 
 * Provides dark/light mode theming to the application.
 * Uses next-themes for seamless theme switching with SSR support.
 * 
 * @module ThemeProvider
 */

'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}