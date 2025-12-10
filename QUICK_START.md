# Quick Start Guide

Get up and running with education evals in 5 minutes.

## Prerequisites

- Node.js 18+
- npm
- Vibecheck API key

## Step 1: Install

```bash
git clone https://github.com/your-org/education-eval.git
cd education-eval
npm install
```

## Step 2: Configure

Export your Vibecheck API key:

```bash
export VIBECHECK_API_KEY=your-key-here
```

## Step 3: Run Your First Eval

```bash
# Run a single eval file
npx vibecheck evals/curriculum/5th-grade-math.yml

# Expected output:
# Running 5th-grade-math-curriculum...
# Passed: 9/10 (90%)
```

## Step 4: Run All Tests

```bash
npm test
```

## Step 5: Understand the Results

Each eval produces:
- **pass/fail** for each test case
- **Output** - the model's actual response
- **Checks** - which validations passed/failed

Example output:
```
✓ How do I add fractions with different denominators? [PASS]
  - llm_judge: PASS
  - not_match "*variable*": PASS
  - not_match "*algebra*": PASS
  - max_tokens: PASS

✗ Can you help me solve for x? [FAIL]
  - llm_judge: PASS
  - not_match "*x = 5*": FAIL (found "x = 5" in response)
```

## What's Next?

1. **Explore existing evals** - Read through `evals/` to understand patterns
2. **Run specific categories** - `npm run test:curriculum` or `npm run test:defensive`
3. **Create your own** - Copy an existing eval and modify for your subject
4. **Set up CI** - Copy `.github/workflows/` to your repo

## Common Commands

```bash
# Run single eval
npx vibecheck evals/curriculum/5th-grade-math.yml

# Run all evals in a directory
npx vibecheck evals/curriculum/

# Run with JSON output
npx vibecheck evals/curriculum/5th-grade-math.yml --json

# Run tests with verbose output
npm run test:verbose

# Run only curriculum tests
npm run test:curriculum

# Run only defensive tests
npm run test:defensive
```

## Troubleshooting

**"API key not found"**
- Ensure you've exported VIBECHECK_API_KEY in your shell
- Check for typos in the environment variable name

**"Rate limit exceeded"**
- Reduce parallel workers in `jest.config.js`
- Add delays between eval runs

**"Timeout errors"**
- Increase `testTimeout` in `jest.config.js`
- Check network connectivity

## Getting Help

- Check [README.md](README.md) for detailed documentation
- Open an issue for bugs or feature requests
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
