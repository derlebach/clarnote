/**
 * Performance Optimization Utilities
 * Provides tools for optimizing app performance
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce hook for optimizing frequent function calls
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef<T>(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

/**
 * Throttle hook for limiting function execution rate
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef<T>(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;
      
      if (timeSinceLastRun >= delay) {
        callbackRef.current(...args);
        lastRunRef.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRunRef.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [delay]
  ) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
}

/**
 * Lazy load images with intersection observer
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    }, options);
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, callback, options]);
}

/**
 * Measure component render performance
 */
export function useRenderTime(componentName: string) {
  const renderStartRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    if (typeof performance !== 'undefined') {
      renderStartRef.current = performance.now();
    }
  });
  
  useEffect(() => {
    if (renderStartRef.current && process.env.NODE_ENV === 'development' && typeof performance !== 'undefined') {
      const renderTime = performance.now() - renderStartRef.current;
      if (renderTime > 16) { // Longer than one frame (60fps)
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    }
  });
}

/**
 * Cache manager for API responses
 */
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private maxAge: number = 5 * 60 * 1000; // 5 minutes default
  
  set(key: string, data: any, maxAge?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old entries if cache gets too large
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }
  
  get(key: string, maxAge?: number): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    const maxCacheAge = maxAge || this.maxAge;
    
    if (age > maxCacheAge) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new CacheManager();

/**
 * Optimize bundle size by lazy loading heavy components
 */
export async function lazyLoadComponent<T>(
  loader: () => Promise<{ default: T }>
): Promise<T> {
  const module = await loader();
  return module.default;
}

interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (window as any).requestIdleCallback
    : (callback: (deadline: IdleDeadline) => void) => {
        const start = Date.now();
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
          });
        }, 1);
      };

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? (window as any).cancelIdleCallback
    : clearTimeout;

/**
 * Batch DOM updates for better performance
 */
export function batchUpdates(updates: (() => void)[]) {
  requestIdleCallback((deadline: IdleDeadline) => {
    while (updates.length > 0 && deadline.timeRemaining() > 0) {
      const update = updates.shift();
      if (update) update();
    }
    
    if (updates.length > 0) {
      batchUpdates(updates);
    }
  });
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
} 