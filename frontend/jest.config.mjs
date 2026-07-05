import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/', '<rootDir>/__tests__/fixtures/'],
  // jose ships ESM-only; let SWC transform it instead of ignoring it.
  transformIgnorePatterns: [
    '/node_modules/(?!(jose)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

export default createJestConfig(config);
