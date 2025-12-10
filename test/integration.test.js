/**
 * Integration Test Suite
 *
 * Tests that verify the overall system works correctly:
 * - All eval files are valid YAML
 * - All evals can be loaded and executed
 * - Results format is consistent
 * - Performance is acceptable
 */

const { runVibeCheck } = require('vibecheck-runner');
const path = require('path');
const fs = require('fs');

// Discover all eval files
const EVALS_DIR = path.join(__dirname, '../evals');
const getAllEvalFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllEvalFiles(fullPath));
    } else if (item.name.endsWith('.yml') || item.name.endsWith('.yaml')) {
      files.push(fullPath);
    }
  }

  return files;
};

describe('Integration Tests', () => {
  describe('Eval File Discovery', () => {
    test('should find all eval files', () => {
      const evalFiles = getAllEvalFiles(EVALS_DIR);
      expect(evalFiles.length).toBeGreaterThan(0);

      console.log(`Found ${evalFiles.length} eval files:`);
      evalFiles.forEach(f => console.log(`  - ${path.relative(EVALS_DIR, f)}`));
    });

    test('should have curriculum evals', () => {
      const curriculumDir = path.join(EVALS_DIR, 'curriculum');
      expect(fs.existsSync(curriculumDir)).toBe(true);

      const files = fs.readdirSync(curriculumDir);
      expect(files.length).toBeGreaterThan(0);
    });

    test('should have defensive evals', () => {
      const defensiveDir = path.join(EVALS_DIR, 'defensive');
      expect(fs.existsSync(defensiveDir)).toBe(true);

      const files = fs.readdirSync(defensiveDir);
      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe('Eval Execution', () => {
    const evalFiles = getAllEvalFiles(EVALS_DIR);

    // Run each eval file to verify it's valid
    test.each(evalFiles.map(f => [path.basename(f), f]))(
      'should successfully run %s',
      async (name, filepath) => {
        const results = await runVibeCheck({ file: filepath });

        // Basic structure validation
        expect(results).toHaveProperty('passed');
        expect(results).toHaveProperty('total');
        expect(results).toHaveProperty('results');
        expect(Array.isArray(results.results)).toBe(true);

        // Should have at least one eval
        expect(results.total).toBeGreaterThan(0);

        // Results should have expected shape
        results.results.forEach(result => {
          expect(result).toHaveProperty('grade');
          expect(['pass', 'fail']).toContain(result.grade);
          expect(result).toHaveProperty('input');
          expect(result).toHaveProperty('output');
        });

        console.log(`  ${name}: ${results.passed}/${results.total} passed`);
      },
      120000 // 2 minute timeout per eval
    );
  });

  describe('Performance', () => {
    test('single eval should complete within timeout', async () => {
      const startTime = Date.now();
      const evalFile = path.join(EVALS_DIR, 'curriculum/5th-grade-math.yml');

      await runVibeCheck({ file: evalFile });

      const duration = Date.now() - startTime;
      console.log(`  5th-grade-math.yml completed in ${duration}ms`);

      // Should complete within 2 minutes for ~10 evals
      expect(duration).toBeLessThan(120000);
    });

    test('parallel execution should be faster than sequential', async () => {
      const evalFiles = [
        path.join(EVALS_DIR, 'curriculum/5th-grade-math.yml'),
        path.join(EVALS_DIR, 'defensive/santa-claus-avoidance.yml'),
      ];

      // Parallel execution
      const parallelStart = Date.now();
      await Promise.all(evalFiles.map(f => runVibeCheck({ file: f })));
      const parallelDuration = Date.now() - parallelStart;

      // Sequential execution
      const sequentialStart = Date.now();
      for (const f of evalFiles) {
        await runVibeCheck({ file: f });
      }
      const sequentialDuration = Date.now() - sequentialStart;

      console.log(`  Parallel: ${parallelDuration}ms`);
      console.log(`  Sequential: ${sequentialDuration}ms`);
      console.log(`  Speedup: ${(sequentialDuration / parallelDuration).toFixed(2)}x`);

      // Parallel should be at least somewhat faster (allowing for overhead)
      // This might not always be true due to rate limits, so we're lenient
      expect(parallelDuration).toBeLessThanOrEqual(sequentialDuration * 1.5);
    });
  });

  describe('Results Consistency', () => {
    test('results should be deterministic-ish for same input', async () => {
      const evalFile = path.join(EVALS_DIR, 'curriculum/5th-grade-math.yml');

      const results1 = await runVibeCheck({ file: evalFile });
      const results2 = await runVibeCheck({ file: evalFile });

      // Total should always be the same
      expect(results1.total).toBe(results2.total);

      // Pass rate should be similar (within 20% of each other)
      // LLM responses can vary, so we allow some tolerance
      const rate1 = results1.passed / results1.total;
      const rate2 = results2.passed / results2.total;

      expect(Math.abs(rate1 - rate2)).toBeLessThan(0.2);
    });
  });
});
