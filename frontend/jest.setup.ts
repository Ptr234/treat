import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Suppress axe logs in test output
jest.spyOn(console, 'error').mockImplementation((...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Not implemented: navigation')
  ) {
    return;
  }
  console.error(...args);
});
