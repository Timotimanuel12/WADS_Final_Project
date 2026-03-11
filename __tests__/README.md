# Test Structure

This directory contains all tests for the WADS Lab application.

## Directory Organization

```
__tests__/
├── unit/              # Unit tests for individual components and utilities
│   ├── components/    # Component tests
│   └── lib/          # Utility and library function tests
├── integration/      # Integration tests for features and API flows
└── README.md
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- Button.test.tsx
```

## Test Conventions

- Use `.test.ts` or `.test.tsx` file extensions
- Group related tests with `describe()` blocks
- Use descriptive test names with `it()` or `test()`
- Mock external dependencies (Firebase, API calls, etc.)
- Test behavior, not implementation details

## Writing Tests

### Unit Tests
Test individual functions, components, and utilities in isolation.

```typescript
describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

### Integration Tests
Test how multiple components or systems work together.

```typescript
describe('Authentication Flow', () => {
  it('should log in user successfully', async () => {
    // Test complete login workflow
  });
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
