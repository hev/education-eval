/**
 * Custom Integration Example
 *
 * Demonstrates how to integrate education evals into your application.
 * This pattern is useful for:
 * - Real-time validation of AI tutor responses
 * - A/B testing different system prompts
 * - Monitoring production quality
 */

const { runEval, runSingleCheck } = require('@vibecheck/runner');
const path = require('path');

// Example 1: Run a full eval suite programmatically
async function runFullEval() {
  console.log('Running full 5th grade math eval...\n');

  const evalPath = path.join(__dirname, '../evals/curriculum/5th-grade-math.yml');
  const results = await runEval(evalPath);

  console.log(`Results: ${results.passed}/${results.total} passed`);
  console.log(`Pass rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  // Analyze failures
  const failures = results.results.filter(r => r.grade === 'fail');
  if (failures.length > 0) {
    console.log('Failed cases:');
    failures.forEach(f => {
      console.log(`  - ${f.input.substring(0, 50)}...`);
      console.log(`    Reason: ${f.failedChecks?.join(', ') || 'Unknown'}`);
    });
  }

  return results;
}

// Example 2: Real-time validation of a single response
async function validateResponse(studentQuestion, tutorResponse) {
  console.log(`Validating response to: "${studentQuestion}"\n`);

  // Check 1: Topic adherence using LLM judge
  const topicCheck = await runSingleCheck({
    type: 'llm_judge',
    response: tutorResponse,
    criteria: `
      This response is from a 5th grade math tutor.
      Verify that:
      1. The content is appropriate for 5th graders (ages 10-11)
      2. It doesn't introduce algebra, calculus, or advanced concepts
      3. The tone is encouraging and age-appropriate
    `
  });

  // Check 2: No forbidden patterns
  const patternChecks = [
    { pattern: /\bx\s*=/, name: 'algebra' },
    { pattern: /derivative|integral|calculus/i, name: 'calculus' },
    { pattern: /negative\s+number/i, name: 'negative numbers' },
  ];

  const patternResults = patternChecks.map(check => ({
    name: check.name,
    passed: !check.pattern.test(tutorResponse)
  }));

  // Aggregate results
  const allPassed = topicCheck.passed && patternResults.every(p => p.passed);

  console.log('Validation Results:');
  console.log(`  Topic adherence: ${topicCheck.passed ? 'PASS' : 'FAIL'}`);
  patternResults.forEach(p => {
    console.log(`  No ${p.name}: ${p.passed ? 'PASS' : 'FAIL'}`);
  });
  console.log(`\nOverall: ${allPassed ? 'VALID' : 'NEEDS REVIEW'}`);

  return {
    valid: allPassed,
    topicCheck,
    patternResults
  };
}

// Example 3: Compare multiple model responses
async function compareModels(prompt, models) {
  console.log(`Comparing models on: "${prompt}"\n`);

  const results = await Promise.all(
    models.map(async model => {
      const evalConfig = {
        metadata: {
          name: 'comparison-eval',
          model: model,
          system_prompt: 'You are a 5th grade math tutor.'
        },
        evals: [{
          prompt: prompt,
          checks: [{
            llm_judge: {
              criteria: 'Response is appropriate for 5th graders and mathematically accurate.'
            }
          }]
        }]
      };

      // Run eval with config object (hypothetical API)
      // const result = await runEvalFromConfig(evalConfig);

      return {
        model,
        // result: result.results[0]
      };
    })
  );

  return results;
}

// Example 4: Production monitoring pattern
class TutorMonitor {
  constructor(options = {}) {
    this.sampleRate = options.sampleRate || 0.1; // 10% of requests
    this.alertThreshold = options.alertThreshold || 0.8;
    this.results = [];
  }

  async checkResponse(question, response) {
    // Sample only a percentage of requests
    if (Math.random() > this.sampleRate) {
      return { sampled: false };
    }

    const validation = await validateResponse(question, response);
    this.results.push({
      timestamp: new Date(),
      question,
      valid: validation.valid
    });

    // Check if we need to alert
    if (this.results.length >= 10) {
      const recentResults = this.results.slice(-10);
      const passRate = recentResults.filter(r => r.valid).length / 10;

      if (passRate < this.alertThreshold) {
        this.sendAlert(passRate);
      }
    }

    return {
      sampled: true,
      validation
    };
  }

  sendAlert(passRate) {
    console.error(`ALERT: Pass rate dropped to ${(passRate * 100).toFixed(1)}%`);
    // In production: send to Slack, PagerDuty, etc.
  }

  getStats() {
    if (this.results.length === 0) return null;

    const valid = this.results.filter(r => r.valid).length;
    return {
      total: this.results.length,
      valid,
      passRate: valid / this.results.length
    };
  }
}

// Demo
async function main() {
  console.log('=== Education Eval Integration Examples ===\n');

  // Example 1
  console.log('--- Example 1: Full Eval Suite ---');
  // await runFullEval();

  // Example 2
  console.log('\n--- Example 2: Single Response Validation ---');
  await validateResponse(
    'How do I add 1/2 + 1/4?',
    'Great question! To add fractions with different denominators, we need to find a common denominator. Since 4 is a multiple of 2, our common denominator is 4. Convert 1/2 to 2/4. Now add: 2/4 + 1/4 = 3/4. You did great asking!'
  );

  console.log('\n--- Example 2b: Invalid Response ---');
  await validateResponse(
    'What is x if 2x = 10?',
    'To solve for x, divide both sides by 2. So x = 5. This is basic algebra!'
  );

  // Example 4
  console.log('\n--- Example 4: Production Monitor ---');
  const monitor = new TutorMonitor({ sampleRate: 1.0 }); // 100% for demo
  console.log('Monitor initialized with 100% sample rate');
  console.log('In production, use 10% (0.1) sample rate');
}

main().catch(console.error);
