/**
 * Jest Configuration
 *
 * Configuration file for Jest testing framework
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/Unit Tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'Working/**/*.js',
    '!Working/exampleUsage.js',
    '!**/node_modules/**',
  ],
  verbose: true,
  testTimeout: 30000,
};
