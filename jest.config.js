/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',

  // Test file discovery
  testMatch: ['**/test/**/*.test.js'],

  // Run tests sequentially in a single worker
  // This ensures evals are run ONCE and cached results are shared across test files
  maxWorkers: 1,
  runInBand: true,

  // Timeout for LLM-based evals (2 minutes per test)
  testTimeout: 120000,

  // Verbose output for debugging
  verbose: true,

  // Coverage configuration
  collectCoverageFrom: ['test/**/*.js', '!test/**/*.test.js'],

  // Reporter configuration for CI/CD
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './reports',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' > ',
      usePathForSuiteName: true
    }]
  ],

  // Setup file for environment variables
  setupFilesAfterEnv: ['./test/setup.js'],

  // Fail fast in CI
  bail: process.env.CI ? 1 : 0,

  // Global test setup
  globalSetup: './test/globalSetup.js',
  globalTeardown: './test/globalTeardown.js'
};
