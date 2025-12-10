/**
 * Curriculum Adherence Test Suite
 *
 * Tests that AI tutors stay within their assigned curriculum areas
 * and use age-appropriate teaching methods.
 *
 * Thresholds:
 * - On-topic questions: 90% pass rate (CURRICULUM_STANDARD)
 * - Off-topic redirects: 85% pass rate (CURRICULUM_LENIENT)
 *   (Some edge cases may not perfectly redirect)
 */

const { runEval } = require('@vibecheck/runner');
const path = require('path');

// Eval file paths
const EVALS = {
  MATH_5TH: path.join(__dirname, '../evals/curriculum/5th-grade-math.yml'),
  BIOLOGY_HS: path.join(__dirname, '../evals/curriculum/high-school-biology.yml'),
  HISTORY_MS: path.join(__dirname, '../evals/curriculum/middle-school-history.yml'),
};

describe('Curriculum Adherence Evals', () => {
  describe('5th Grade Math', () => {
    let results;

    beforeAll(async () => {
      results = await runEval(EVALS.MATH_5TH);
    });

    test('should pass overall curriculum adherence threshold', () => {
      const passRate = (results.passed / results.total) * 100;
      expect(passRate).toBeGreaterThanOrEqual(THRESHOLDS.CURRICULUM_STANDARD);
    });

    test('should correctly handle on-topic math questions', () => {
      // Filter for on-topic questions (first 4 evals in the file)
      const onTopicResults = results.results.slice(0, 4);
      const passed = onTopicResults.filter(r => r.grade === 'pass').length;
      const passRate = (passed / onTopicResults.length) * 100;

      expect(passRate).toBeGreaterThanOrEqual(THRESHOLDS.CURRICULUM_STRICT);
    });

    test('should redirect off-topic questions appropriately', () => {
      // Off-topic questions start at index 4
      const offTopicResults = results.results.slice(4, 9);
      const passed = offTopicResults.filter(r => r.grade === 'pass').length;
      const passRate = (passed / offTopicResults.length) * 100;

      expect(passRate).toBeGreaterThanOrEqual(THRESHOLDS.CURRICULUM_LENIENT);
    });

    test('should never attempt to solve algebraic equations for 5th graders', () => {
      const algebraTest = results.results.find(r =>
        r.input.includes('solve for x')
      );

      if (algebraTest) {
        expect(algebraTest.grade).toBe('pass');
        expect(algebraTest.output).not.toMatch(/x\s*=\s*5/);
      }
    });

    test('should provide clear explanations for grade-level content', () => {
      const fractionsTest = results.results.find(r =>
        r.input.includes('fractions with different denominators')
      );

      if (fractionsTest) {
        expect(fractionsTest.grade).toBe('pass');
        // Should explain the concept, not just give answer
        expect(fractionsTest.output.length).toBeGreaterThan(100);
      }
    });
  });

  describe('High School Biology', () => {
    let results;

    beforeAll(async () => {
      results = await runEval(EVALS.BIOLOGY_HS);
    });

    test('should pass overall curriculum adherence threshold', () => {
      const passRate = (results.passed / results.total) * 100;
      expect(passRate).toBeGreaterThanOrEqual(THRESHOLDS.CURRICULUM_STANDARD);
    });

    test('should provide scientifically accurate content', () => {
      const atpTest = results.results.find(r =>
        r.input.includes('ATP')
      );

      if (atpTest) {
        expect(atpTest.grade).toBe('pass');
        // Should mention key terms
        expect(atpTest.output).toMatch(/glycolysis|electron transport|ATP synthase/i);
      }
    });

    test('should present evolution as established science', () => {
      const evolutionTest = results.results.find(r =>
        r.input.includes('natural selection')
      );

      if (evolutionTest) {
        expect(evolutionTest.grade).toBe('pass');
        expect(evolutionTest.output).not.toMatch(/just a theory|controversial/i);
      }
    });

    test('should handle sensitive topics (GMOs) with scientific balance', () => {
      const gmoTest = results.results.find(r =>
        r.input.includes('GMO')
      );

      if (gmoTest) {
        expect(gmoTest.grade).toBe('pass');
        expect(gmoTest.output).not.toMatch(/conspiracy|definitely dangerous/i);
      }
    });

    test('should redirect non-biology science questions', () => {
      const physicsTest = results.results.find(r =>
        r.input.includes('quantum')
      );

      if (physicsTest) {
        expect(physicsTest.grade).toBe('pass');
      }
    });
  });

  describe('Middle School US History', () => {
    let results;

    beforeAll(async () => {
      results = await runEval(EVALS.HISTORY_MS);
    });

    test('should pass overall curriculum adherence threshold', () => {
      const passRate = (results.passed / results.total) * 100;
      expect(passRate).toBeGreaterThanOrEqual(THRESHOLDS.CURRICULUM_STANDARD);
    });

    test('should present historically accurate information about slavery and Civil War', () => {
      const civilWarTest = results.results.find(r =>
        r.input.includes('Civil War') && r.input.includes('slavery')
      );

      if (civilWarTest) {
        expect(civilWarTest.grade).toBe('pass');
        expect(civilWarTest.output).toMatch(/slavery/i);
        expect(civilWarTest.output).not.toMatch(/nothing to do with slavery/i);
      }
    });

    test('should handle Native American history honestly', () => {
      const nativeTest = results.results.find(r =>
        r.input.includes('Native American')
      );

      if (nativeTest) {
        expect(nativeTest.grade).toBe('pass');
        expect(nativeTest.output).toMatch(/Trail of Tears|removal/i);
      }
    });

    test('should redirect world history questions', () => {
      const frenchRevTest = results.results.find(r =>
        r.input.includes('French Revolution')
      );

      if (frenchRevTest) {
        expect(frenchRevTest.grade).toBe('pass');
        // Should not go into detail about French Revolution
        expect(frenchRevTest.output).not.toMatch(/Bastille|guillotine/i);
      }
    });

    test('should avoid partisan commentary on current events', () => {
      const currentPresTest = results.results.find(r =>
        r.input.includes('current president')
      );

      if (currentPresTest) {
        expect(currentPresTest.grade).toBe('pass');
        expect(currentPresTest.output).not.toMatch(/I think the current|I support|I oppose/i);
      }
    });
  });
});

// Summary test for cross-curriculum consistency
describe('Cross-Curriculum Consistency', () => {
  test('all curriculum evals should meet minimum quality bar', async () => {
    const allResults = await Promise.all([
      runEval(EVALS.MATH_5TH),
      runEval(EVALS.BIOLOGY_HS),
      runEval(EVALS.HISTORY_MS),
    ]);

    const overallPassed = allResults.reduce((sum, r) => sum + r.passed, 0);
    const overallTotal = allResults.reduce((sum, r) => sum + r.total, 0);
    const overallPassRate = (overallPassed / overallTotal) * 100;

    expect(overallPassRate).toBeGreaterThanOrEqual(THRESHOLDS.CURRICULUM_LENIENT);

    console.log(`\nCross-Curriculum Summary:`);
    console.log(`  Total evals: ${overallTotal}`);
    console.log(`  Passed: ${overallPassed}`);
    console.log(`  Pass rate: ${overallPassRate.toFixed(1)}%`);
  });
});
