/**
 * Integration Test Suite
 *
 * Tests that verify the overall system works correctly:
 * - All eval files are valid YAML
 * - All evals can be loaded and executed
 * - Results format is consistent
 *
 * NOTE: Evals are run ONCE via runAllEvalsOnce() and cached.
 * All tests use the cached results - no additional eval runs needed.
 */

const path = require('path');
const fs = require('fs');

// Discover all eval files (for file discovery tests only)
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

// Run all evals once at the start of this test file
beforeAll(async () => {
  await runAllEvalsOnce();
});

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
    // Map of eval file names to cache keys
    const evalFileToKey = {
      '5th-grade-math.yml': 'MATH_5TH',
      'high-school-biology.yml': 'BIOLOGY_HS',
      'middle-school-history.yml': 'HISTORY_MS',
      'santa-claus-avoidance.yml': 'SANTA',
      'no-homework-completion.yml': 'HOMEWORK',
      'no-test-answers.yml': 'TEST_ANSWERS',
      'personal-boundaries.yml': 'PERSONAL',
    };

    const evalFiles = getAllEvalFiles(EVALS_DIR);

    // Verify each eval file was run successfully (uses cached results)
    test.each(evalFiles.map(f => [path.basename(f), f]))(
      'should have valid results for %s',
      (name, filepath) => {
        const cacheKey = evalFileToKey[name];
        expect(cacheKey).toBeDefined();

        const results = getEvalResults()[cacheKey];

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
      }
    );
  });

  describe('Performance', () => {
    test('all evals should have completed within reasonable time', () => {
      const meta = getEvalResults()._meta;
      expect(meta).toBeDefined();
      expect(meta.runTime).toBeDefined();

      console.log(`  All evals completed in ${meta.runTime}ms`);

      // All 7 evals should complete within 5 minutes total
      expect(meta.runTime).toBeLessThan(300000);
    });
  });

  describe('Results Consistency', () => {
    test('all eval results should have consistent structure', () => {
      const cache = getEvalResults();
      const evalKeys = ['MATH_5TH', 'BIOLOGY_HS', 'HISTORY_MS', 'SANTA', 'HOMEWORK', 'TEST_ANSWERS', 'PERSONAL'];

      evalKeys.forEach(key => {
        const results = cache[key];
        expect(results).toBeDefined();
        expect(typeof results.passed).toBe('number');
        expect(typeof results.total).toBe('number');
        expect(results.passed).toBeLessThanOrEqual(results.total);
        expect(results.results.length).toBe(results.total);
      });
    });

    test('total eval count should match expected', () => {
      const cache = getEvalResults();
      const evalKeys = ['MATH_5TH', 'BIOLOGY_HS', 'HISTORY_MS', 'SANTA', 'HOMEWORK', 'TEST_ANSWERS', 'PERSONAL'];

      const totalEvals = evalKeys.reduce((sum, key) => sum + cache[key].total, 0);

      console.log(`  Total evals across all files: ${totalEvals}`);

      // Should have a reasonable number of evals
      expect(totalEvals).toBeGreaterThan(50);
    });
  });
});
