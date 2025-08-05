'use client'

import { useEffect, useRef } from 'react'

interface DebugRenderProps {
  componentName: string
}

export function DebugRender({ componentName }: DebugRenderProps) {
  const renderCount = useRef(0)
  
  useEffect(() => {
    renderCount.current += 1
    console.log(`${componentName} rendered ${renderCount.current} times`)
  })

  return null
} 