import { useEffect, useRef, useState, RefObject } from 'react';

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook that uses Intersection Observer API to detect when an element is visible
 * @param options - Intersection Observer options
 * @returns Object with ref to attach to element and isIntersecting state
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T | null>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<T>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
          
          // If triggerOnce is true, stop observing after first intersection
          if (entry.isIntersecting && triggerOnce) {
            observer.unobserve(target);
          }
        });
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return [targetRef, isIntersecting];
}

/**
 * Hook for infinite scrolling using Intersection Observer
 * @param onIntersect - Callback to execute when intersection occurs
 * @param options - Intersection Observer options
 * @returns Ref to attach to the trigger element
 */
export function useInfiniteScroll<T extends Element = HTMLDivElement>(
  onIntersect: () => void,
  options: UseIntersectionObserverOptions = {}
): RefObject<T | null> {
  const [ref, isIntersecting] = useIntersectionObserver<T>({
    threshold: 0.1,
    ...options
  });

  useEffect(() => {
    if (isIntersecting) {
      onIntersect();
    }
  }, [isIntersecting, onIntersect]);

  return ref;
}

/**
 * Hook for lazy loading images using Intersection Observer
 * @param src - Image source URL
 * @param options - Intersection Observer options
 * @returns Object with image ref, loaded state, and src to use
 */
export function useLazyImage(
  src: string,
  options: UseIntersectionObserverOptions = {}
): {
  ref: RefObject<HTMLImageElement | null>;
  isLoaded: boolean;
  imageSrc: string;
} {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLImageElement>({
    triggerOnce: true,
    ...options
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (isIntersecting && src && !isLoaded) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setIsLoaded(true); // Mark as loaded even on error to prevent retry loops
      };
      img.src = src;
    }
  }, [isIntersecting, src, isLoaded]);

  return {
    ref,
    isLoaded,
    imageSrc
  };
}

/**
 * Hook for tracking element visibility with callback
 * @param callback - Function to call when visibility changes
 * @param options - Intersection Observer options
 * @returns Ref to attach to the element to track
 */
export function useVisibilityTracker<T extends Element = HTMLDivElement>(
  callback: (isVisible: boolean, entry: IntersectionObserverEntry) => void,
  options: UseIntersectionObserverOptions = {}
): RefObject<T | null> {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    if (!('IntersectionObserver' in window)) {
      callback(true, {} as IntersectionObserverEntry);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          callback(entry.isIntersecting, entry);
        });
      },
      {
        threshold: options.threshold || 0,
        root: options.root || null,
        rootMargin: options.rootMargin || '0px'
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options.threshold, options.root, options.rootMargin]);

  return targetRef;
}