'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
// import { type ThemeProviderProps } from 'next-themes/dist/types' // Remove this import

// Define props inline matching expected types
interface CustomThemeProviderProps {
    children: React.ReactNode;
    attribute: 'class'; // Explicitly set to 'class' as that's our strategy
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean; // Common prop
    // Add other relevant props from next-themes if needed
}

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  // Ensure attribute='class' is passed, overriding if necessary
  const providerProps = { ...props, attribute: 'class' as const }; 
  return <NextThemesProvider {...providerProps}>{children}</NextThemesProvider>
} 