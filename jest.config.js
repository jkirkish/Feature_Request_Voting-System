module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^uuid$': require.resolve('uuid'),
    '^next-auth$': require.resolve('next-auth'),
    '^next-auth/react$': require.resolve('next-auth/react'),
    '^next-auth/next$': require.resolve('next-auth/next'),
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@auth/prisma-adapter|next-auth|@prisma/client|jose|openid-client|@panva/hkdf|uuid|preact|preact-render-to-string)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  resolver: '<rootDir>/jest.resolver.js',
} 