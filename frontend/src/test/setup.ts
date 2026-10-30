import '@testing-library/jest-dom/vitest'

// jsdom lacks these browser APIs, which Ant Design relies on.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

// jsdom can't compute pseudo-element styles (antd asks for them); ignore the pseudo argument.
const computeStyle = window.getComputedStyle.bind(window)
window.getComputedStyle = (element: Element) => computeStyle(element)
