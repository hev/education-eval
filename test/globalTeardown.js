/**
 * Global teardown - runs once after all test suites
 * Use for cleanup and final reporting
 */

module.exports = async () => {
  const duration = Date.now() - (global.__START_TIME__ || Date.now());
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(1);

  console.log('\n========================================');
  console.log('Education Eval Suite - Complete');
  console.log(`Total Duration: ${minutes}m ${seconds}s`);
  console.log('========================================\n');
};
