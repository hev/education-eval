# Education AI Eval Suite

A comprehensive evaluation framework for AI tutors in educational settings. Built on [Vibecheck](https://github.com/hev/vibecheck), this repository provides production-ready evals for:

- **Curriculum adherence** - Ensuring tutors stay within grade-level topics
- **Defensive behaviors** - Preventing inappropriate responses and maintaining boundaries

This is a reference implementation designed to be forked and adapted by education companies building AI-powered learning tools.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/education-eval.git
cd education-eval

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run a single eval
npx vibecheck evals/curriculum/5th-grade-math.yml

# Run all tests
npm test
```

## Repository Structure

```
education-eval/
├── evals/
│   ├── curriculum/           # Grade/subject-specific evals
│   │   ├── 5th-grade-math.yml
│   │   ├── high-school-biology.yml
│   │   └── middle-school-history.yml
│   └── defensive/            # Safety and boundary evals
│       ├── santa-claus-avoidance.yml
│       ├── no-homework-completion.yml
│       ├── no-test-answers.yml
│       └── personal-boundaries.yml
├── test/                     # Jest test suites
│   ├── curriculum.test.js
│   ├── defensive.test.js
│   └── integration.test.js
├── .github/workflows/        # CI/CD pipelines
│   ├── eval-ci.yml
│   └── scheduled-evals.yml
└── examples/                 # Integration examples
```

## Eval Categories

### Curriculum Evals

Test that AI tutors stay within their assigned subject and grade level:

| Eval | Description | Threshold |
|------|-------------|-----------|
| `5th-grade-math` | Elementary math concepts, no algebra | 90% |
| `high-school-biology` | AP Biology content, scientific accuracy | 90% |
| `middle-school-history` | US History 1607-1877, balanced perspectives | 85% |

**Key features:**
- Extensive system prompts defining curriculum boundaries
- LLM-as-judge for nuanced topic adherence
- Tests both on-topic help AND off-topic redirection

### Defensive Evals

Test that AI tutors maintain appropriate boundaries:

| Eval | Description | Threshold |
|------|-------------|-----------|
| `santa-claus-avoidance` | Neither confirms nor denies childhood figures | 95% |
| `no-homework-completion` | Teaches, doesn't do assignments | 98% |
| `no-test-answers` | Refuses help during active assessments | 98% |
| `personal-boundaries` | Redirects personal issues to adults | 95% |

**Key features:**
- Higher thresholds for safety-critical behaviors
- Pattern matching AND LLM-judge checks
- Tests edge cases and creative avoidance attempts

## Writing Your Own Evals

### Basic Structure

```yaml
metadata:
  name: my-curriculum-eval
  model: anthropic/claude-3.5-sonnet
  system_prompt: |
    Your detailed system prompt here...
    Define curriculum scope, teaching guidelines, boundaries.

evals:
  - prompt: "Student question here"
    checks:
      - llm_judge:
          criteria: |
            What the response should/shouldn't include...
      - match: "*expected content*"
      - not_match: "*forbidden content*"
      - max_tokens: 400
```

### Check Types

| Check | Usage | Example |
|-------|-------|---------|
| `llm_judge` | Nuanced evaluation | `criteria: "Response should be encouraging..."` |
| `match` | Content must include | `"*photosynthesis*"` |
| `not_match` | Content must exclude | `"*x = 5*"` |
| `max_tokens` | Length limit | `400` |
| `min_tokens` | Minimum length | `50` |

### Threshold Guidelines

| Eval Type | Recommended Threshold | Rationale |
|-----------|----------------------|-----------|
| Curriculum - strict | 95% | Core subject matter |
| Curriculum - standard | 90% | General adherence |
| Curriculum - lenient | 85% | Subjective/edge cases |
| Defensive - critical | 98-100% | Academic integrity |
| Defensive - standard | 95% | Important boundaries |

## CI/CD Integration

### GitHub Actions

The included workflows provide:

1. **`eval-ci.yml`** - Runs on push/PR
   - Validates YAML syntax
   - Runs curriculum and defensive evals in parallel
   - Matrix strategy for different thresholds
   - Uploads results as artifacts

2. **`scheduled-evals.yml`** - Daily scheduled runs
   - Detects model drift
   - Creates issues on failure
   - 90-day result retention

### Required Secrets

Add these to your GitHub repository secrets:

- `ANTHROPIC_API_KEY` - Your Anthropic API key

### Manual Triggers

```bash
# Run specific category via GitHub Actions UI
# Or use gh CLI:
gh workflow run eval-ci.yml -f eval_category=defensive
```

## Test Suite

```bash
# Run all tests
npm test

# Run specific test file
npm run test:curriculum
npm run test:defensive

# Watch mode for development
npm run test:watch

# With coverage
npm run test:coverage
```

### Threshold Configuration

Thresholds are defined in `test/setup.js`:

```javascript
global.THRESHOLDS = {
  CURRICULUM_STRICT: 95,
  CURRICULUM_STANDARD: 90,
  CURRICULUM_LENIENT: 85,
  DEFENSIVE_STRICT: 100,
  DEFENSIVE_STANDARD: 98,
  DEFENSIVE_LENIENT: 95,
};
```

## Adapting for Your Use Case

### Adding a New Subject

1. Create `evals/curriculum/your-subject.yml`
2. Define comprehensive system prompt with:
   - Curriculum scope (topics IN scope)
   - Teaching guidelines (how to teach)
   - Boundaries (what to redirect)
3. Add test cases for both on-topic and off-topic scenarios
4. Add to `test/curriculum.test.js`
5. Add to CI matrix in `.github/workflows/eval-ci.yml`

### Adding a New Defensive Behavior

1. Create `evals/defensive/your-behavior.yml`
2. Define the behavior to avoid/enforce
3. Include edge cases and creative circumvention attempts
4. Set appropriate threshold (higher for safety-critical)
5. Add to `test/defensive.test.js`
6. Add to CI matrix

### Customizing Thresholds

Different organizations may have different tolerance levels:

```javascript
// More strict (recommended for production)
DEFENSIVE_STANDARD: 99,

// More lenient (acceptable for development)
DEFENSIVE_STANDARD: 95,
```

## Roadmap Integration

This repository tracks relevant [Vibecheck roadmap items](https://github.com/hev/vibecheck/issues):

- **Issue #14**: GitHub Action - Will simplify CI integration
- **Issue #35**: Enhanced llm_judge - Will enable configurable judge models
- **Issue #29**: Global checks - Will reduce duplication in eval files

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Good First Issues

- Add evals for additional grade levels
- Create subject-specific evals (art, music, PE)
- Improve edge case coverage in defensive evals
- Add internationalization examples

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

Built with [Vibecheck](https://github.com/hev/vibecheck) by the education AI community.
