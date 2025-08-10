import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { accessibilityTestUtils } from '../utils/accessibilityManager'

// CRITICAL: DOM mocks MUST be setup BEFORE extending expect and other imports
// to ensure they're available when components/hooks are loaded

// Setup window.matchMedia FIRST - this is critical for framer-motion and useAccessibility
const matchMediaMock = vi.fn().mockImplementation(query => ({
  matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
})

// Setup other essential window methods
Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: vi.fn(),
})

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Setup accessibility testing
accessibilityTestUtils.setupJestAxe()

// Clean up after each test case
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))


// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
  },
})

// Enhanced getComputedStyle mock for accessibility testing
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn().mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue(''),
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
    outline: 'none',
    outlineWidth: '0px',
    boxShadow: 'none',
    borderColor: 'rgb(0, 0, 0)',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5'
  }),
})

// Mock HTMLElement methods for accessibility testing
HTMLElement.prototype.scrollIntoView = vi.fn()
HTMLElement.prototype.focus = vi.fn()
HTMLElement.prototype.blur = vi.fn()


// Mock requestAnimationFrame for framer-motion
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn(callback => setTimeout(callback, 16)),
})

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: vi.fn(),
})

// Additional DOM properties that framer-motion might access
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  get: vi.fn().mockReturnValue(null),
})

Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
  get: vi.fn().mockReturnValue(0),
})

Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
  get: vi.fn().mockReturnValue(0),
})

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  get: vi.fn().mockReturnValue(100),
})

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  get: vi.fn().mockReturnValue(100),
})