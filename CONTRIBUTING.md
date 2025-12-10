# Contributing to Education Eval Suite

Thank you for your interest in contributing! This document provides guidelines for contributing to the education eval suite.

## Ways to Contribute

### 1. Add New Curriculum Evals

We welcome evals for additional subjects and grade levels:

- Elementary subjects (K-5)
- Middle school subjects (6-8)
- High school subjects (9-12)
- Specialized topics (AP courses, electives)

### 2. Improve Defensive Evals

Help us cover more edge cases:

- New boundary scenarios
- Creative circumvention attempts
- Cultural/regional variations

### 3. Enhance Documentation

- Improve existing docs
- Add examples
- Translate to other languages

### 4. Fix Bugs

- Report issues you find
- Submit fixes for existing issues

## How to Contribute

### Step 1: Fork and Clone

```bash
git clone https://github.com/your-username/education-eval.git
cd education-eval
npm install
```

### Step 2: Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### Step 3: Make Changes

Follow these guidelines:

#### For New Evals

1. Place in appropriate directory (`evals/curriculum/` or `evals/defensive/`)
2. Follow existing naming conventions (`grade-subject.yml`)
3. Include comprehensive system prompt
4. Add at least 8-10 test cases covering:
   - On-topic/appropriate behavior (positive tests)
   - Off-topic/inappropriate behavior (negative tests)
   - Edge cases
5. Add corresponding tests in `test/`

#### For Code Changes

1. Follow existing code style
2. Add tests for new functionality
3. Update documentation as needed

### Step 4: Test Your Changes

```bash
# Run all tests
npm test

# Run specific test file
npm run test:curriculum

# Verify your new eval works
npx vibecheck evals/your-new-eval.yml
```

### Step 5: Submit PR

1. Push your branch
2. Create a pull request
3. Fill out the PR template
4. Wait for review

## Eval Quality Guidelines

### System Prompts

Good system prompts should:

- Clearly define curriculum scope
- Specify teaching style and tone
- List explicit boundaries
- Provide guidance for edge cases

### Test Cases

Good test cases should:

- Cover common scenarios
- Include edge cases
- Test both positive and negative behaviors
- Have clear, specific criteria

### LLM Judge Criteria

Good criteria should:

- Be specific and measurable
- List what should AND shouldn't appear
- Consider multiple aspects of quality
- Be fair to reasonable variations

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Credit others' contributions

## Questions?

Open an issue with the "question" label and we'll help!
