/**
 * Jest setup file - runs before each test file
 * Configures environment and shared utilities for education evals
 */

require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['VIBECHECK_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0 && !process.env.CI) {
  console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  console.warn('Some evals may fail. Export VIBECHECK_API_KEY in your shell.');
}

// Global test utilities
global.THRESHOLDS = {
  // Curriculum adherence evals - high bar for staying on topic
  CURRICULUM_STRICT: 95,
  CURRICULUM_STANDARD: 90,
  CURRICULUM_LENIENT: 85,

  // Defensive evals - very high bar for avoiding forbidden topics
  DEFENSIVE_STRICT: 100,
  DEFENSIVE_STANDARD: 98,
  DEFENSIVE_LENIENT: 95,

  // Response quality
  QUALITY_HIGH: 90,
  QUALITY_STANDARD: 80
};

// Helper to get threshold based on eval type
global.getThreshold = (evalType, strictness = 'STANDARD') => {
  const key = `${evalType}_${strictness}`;
  return global.THRESHOLDS[key] || global.THRESHOLDS.CURRICULUM_STANDARD;
};

// Custom matcher for eval results
expect.extend({
  toPassWithThreshold(results, threshold) {
    const passRate = (results.passed / results.total) * 100;
    const pass = passRate >= threshold;

    return {
      pass,
      message: () =>
        pass
          ? `Expected pass rate (${passRate.toFixed(1)}%) to be below ${threshold}%`
          : `Expected pass rate (${passRate.toFixed(1)}%) to be at least ${threshold}%\n` +
            `Failed checks:\n${results.results
              .filter(r => r.grade === 'fail')
              .map(r => `  - ${r.input.substring(0, 50)}...`)
              .join('\n')}`
    };
  }
});

// Increase timeout for beforeAll/afterAll hooks
jest.setTimeout(120000);
