import '@testing-library/jest-dom'

// Mock fetch for Firebase and API calls
global.fetch = jest.fn() as jest.Mock

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}))

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => {
    // Return unsubscribe function
    return jest.fn()
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
