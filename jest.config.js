/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',

  // Test file discovery
  testMatch: ['**/test/**/*.test.js'],

  // Parallel execution configuration
  // Each eval makes LLM API calls, so we limit workers to avoid rate limits
  // Adjust based on your API tier and rate limits
  maxWorkers: 4,

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
