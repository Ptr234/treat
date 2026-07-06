declare module 'jest-axe' {
  export function axe(
    html: Element | Document | string,
    options?: Record<string, unknown>
  ): Promise<unknown>;

  export const toHaveNoViolations: Record<string, jest.CustomMatcher>;
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}
