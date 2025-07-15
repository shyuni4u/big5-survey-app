// jest.config.js
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // 이 파일을 생성할 것입니다
  moduleNameMapper: {
    // Handle module aliases (this should match your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/globals.css',
    '!src/lib/fonts/**',
    '!src/scripts/**', // Python 스크립트는 별도로 테스트
  ],
}

// createJestConfig is  a function that returns a promise and wraps the test config object.
// So we have to call it in the next way
module.exports = createJestConfig(customJestConfig)
