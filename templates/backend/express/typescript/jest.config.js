/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  automock: true,
  collectCoverage: true,
  coverageProvider: "babel",
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "src/**/*.{ts,tsx}",
    "!vendor/**/*.{js,jsx}",
    "!**/node_modules/**",
  ],
  maxConcurrency: 5,
  verbose: true,
};
