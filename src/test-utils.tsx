import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

interface WrapperProps {
  children: React.ReactNode
}

function Wrapper({ children }: WrapperProps) {
  return (
    <SessionProvider session={null}>
      {children}
    </SessionProvider>
  )
}

function render(ui: React.ReactElement, options: Omit<RenderOptions, 'wrapper'> = {}) {
  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { render } 