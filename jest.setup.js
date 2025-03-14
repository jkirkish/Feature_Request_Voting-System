import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Add TextEncoder and TextDecoder for jose
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock crypto for jose
const crypto = require('crypto')

// Create a mock SubtleCrypto
const mockSubtleCrypto = {
  digest: jest.fn().mockImplementation(async (algorithm, data) => {
    return Buffer.from('mocked-hash')
  }),
  encrypt: jest.fn().mockImplementation(async () => Buffer.from('mocked-encrypted')),
  decrypt: jest.fn().mockImplementation(async () => Buffer.from('mocked-decrypted')),
  sign: jest.fn().mockImplementation(async () => Buffer.from('mocked-signature')),
  verify: jest.fn().mockImplementation(async () => true),
  deriveBits: jest.fn().mockImplementation(async () => Buffer.from('mocked-bits')),
  deriveKey: jest.fn().mockImplementation(async () => ({ type: 'secret' })),
  generateKey: jest.fn().mockImplementation(async () => ({ type: 'secret' })),
  exportKey: jest.fn().mockImplementation(async () => Buffer.from('mocked-key')),
  importKey: jest.fn().mockImplementation(async () => ({ type: 'secret' })),
  wrapKey: jest.fn().mockImplementation(async () => Buffer.from('mocked-wrapped')),
  unwrapKey: jest.fn().mockImplementation(async () => ({ type: 'secret' })),
}

// Mock the crypto API
global.crypto = {
  getRandomValues: function(buffer) {
    return crypto.randomFillSync(buffer)
  },
  subtle: mockSubtleCrypto,
  randomUUID: () => 'mocked-uuid',
}

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: () => Promise.resolve(body),
      status: init?.status || 200,
      headers: new Headers(init?.headers || {}),
    })),
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
  })),
  usePathname: jest.fn(),
}))

// Mock next-auth
jest.mock('next-auth', () => {
  const originalModule = jest.requireActual('next-auth')
  return {
    ...originalModule,
    default: jest.fn(),
  }
})

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  getSession: jest.fn(),
  getProviders: jest.fn(),
  getCsrfToken: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => null),
}))

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}))

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(true),
  })),
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    feature: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    vote: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock axios
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: { baseURL: '' },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
}

const mockPost = jest.fn()
mockPost.mockResolvedValue = jest.fn()
mockPost.mockRejectedValue = jest.fn()

jest.mock('axios', () => {
  const actual = jest.requireActual('axios')
  return {
    ...actual,
    default: {
      ...mockAxiosInstance,
      create: jest.fn(() => mockAxiosInstance),
      post: mockPost,
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      isAxiosError: jest.fn().mockImplementation((error) => {
        return error && error.response && error.response.data;
      }),
    },
    create: jest.fn(() => mockAxiosInstance),
    post: mockPost,
    isAxiosError: jest.fn().mockImplementation((error) => {
      return error && error.response && error.response.data;
    }),
  }
})

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}))

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('randomToken'),
  }),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('hashedValue'),
    }),
  }),
  getHashes: jest.fn().mockReturnValue(['sha256', 'sha512']),
}))

// Suppress console.error in tests
console.error = jest.fn()
console.log = jest.fn() 