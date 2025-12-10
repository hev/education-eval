/**
 * Global setup - runs once before all test suites
 * Use for expensive one-time setup like API validation
 */

module.exports = async () => {
  console.log('\n========================================');
  console.log('Education Eval Suite - Starting');
  console.log('========================================\n');

  // Store start time for total duration tracking
  global.__START_TIME__ = Date.now();

  // Validate API connectivity (optional - comment out for offline testing)
  if (process.env.VALIDATE_API_ON_START === 'true') {
    console.log('Validating API connectivity...');
    // Add API health check here if needed
  }
};
