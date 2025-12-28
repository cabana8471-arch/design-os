import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock import.meta.glob for testing
vi.mock('import.meta', () => ({
  glob: vi.fn(() => ({})),
}))

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})
