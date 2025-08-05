import { useRef, useCallback, useEffect, useState, useMemo } from 'react'

// Hook for debouncing values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling function calls
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastRan = useRef<number>(0)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRan.current >= delay) {
        func(...args)
        lastRan.current = now
      }
    }) as T,
    [func, delay]
  )
}

// Hook for memoizing expensive calculations
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: any[]
): T {
  return useMemo(calculation, dependencies)
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [options, hasIntersected])

  return {
    targetRef,
    isIntersecting,
    hasIntersected
  }
}

// Hook for measuring component performance
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>(0)
  const [metrics, setMetrics] = useState<{
    renderTime: number
    renderCount: number
    averageRenderTime: number
  }>({
    renderTime: 0,
    renderCount: 0,
    averageRenderTime: 0
  })

  useEffect(() => {
    startTime.current = performance.now()
  })

  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    setMetrics(prev => {
      const newRenderCount = prev.renderCount + 1
      const totalTime = prev.averageRenderTime * prev.renderCount + renderTime
      const newAverageRenderTime = totalTime / newRenderCount

      return {
        renderTime,
        renderCount: newRenderCount,
        averageRenderTime: newAverageRenderTime
      }
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} render time:`, renderTime.toFixed(2), 'ms')
    }
  })

  return metrics
}

// Hook for virtual scrolling
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )

  const visibleItems = items.slice(visibleStart, visibleEnd)
  const totalHeight = items.length * itemHeight
  const offsetY = visibleStart * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleStart,
    visibleEnd
  }
}

// Hook for lazy loading images
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const { targetRef, hasIntersected } = useIntersectionObserver()

  useEffect(() => {
    if (!hasIntersected) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    img.onerror = () => {
      setIsError(true)
    }
    img.src = src
  }, [hasIntersected, src])

  return {
    ref: targetRef,
    src: imageSrc,
    isLoaded,
    isError
  }
}

// Hook for batching state updates
export function useBatchedUpdates() {
  const [updates, setUpdates] = useState<(() => void)[]>([])

  const batchUpdate = useCallback((updateFn: () => void) => {
    setUpdates(prev => [...prev, updateFn])
  }, [])

  const flushUpdates = useCallback(() => {
    updates.forEach(update => update())
    setUpdates([])
  }, [updates])

  // Auto-flush updates on next tick
  useEffect(() => {
    if (updates.length > 0) {
      const timeoutId = setTimeout(flushUpdates, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [updates, flushUpdates])

  return { batchUpdate, flushUpdates }
}

// Hook for web workers
export function useWebWorker(workerFunction: Function) {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  const runWorker = useCallback(async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create worker from function
      const workerScript = `
        self.onmessage = function(e) {
          const result = (${workerFunction.toString()})(e.data);
          self.postMessage(result);
        }
      `
      
      const blob = new Blob([workerScript], { type: 'application/javascript' })
      const worker = new Worker(URL.createObjectURL(blob))

      workerRef.current = worker

      worker.postMessage(data)

      worker.onmessage = (e) => {
        setResult(e.data)
        setIsLoading(false)
        worker.terminate()
        workerRef.current = null
      }

      worker.onerror = (e) => {
        setError(new Error(e.message))
        setIsLoading(false)
        worker.terminate()
        workerRef.current = null
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Worker error'))
      setIsLoading(false)
    }
  }, [workerFunction])

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      terminateWorker()
    }
  }, [terminateWorker])

  return {
    result,
    error,
    isLoading,
    runWorker,
    terminateWorker
  }
}
