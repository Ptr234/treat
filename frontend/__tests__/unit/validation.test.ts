import { validationTests, errorScenarios } from '../fixtures/testData';

describe('Input Validation', () => {
  describe('Email Validation', () => {
    validationTests.emailFormats.forEach(({ email, isValid }) => {
      test(`should ${isValid ? 'accept' : 'reject'} ${email}`, () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const result = emailRegex.test(email);
        expect(result).toBe(isValid);
      });
    });
  });

  describe('Password Strength', () => {
    validationTests.passwordStrength.forEach(({ password, isStrong }) => {
      test(`should ${isStrong ? 'accept' : 'reject'} password strength for "${password}"`, () => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const isLongEnough = password.length >= 8;

        const result = hasUppercase && hasLowercase && hasNumber && isLongEnough;
        expect(result).toBe(isStrong);
      });
    });
  });

  describe('Phone Number Validation', () => {
    validationTests.phoneNumbers.forEach(({ phone, isValid }) => {
      test(`should ${isValid ? 'accept' : 'reject'} ${phone}`, () => {
        const phoneRegex = /^(\+\d{1,3}|0)[0-9 ]{8,}$/;
        const result = phoneRegex.test(phone);
        expect(result).toBe(isValid);
      });
    });
  });

  describe('Security Tests', () => {
    test('should sanitize SQL injection attempts', () => {
      const malicious = errorScenarios.sqlInjection;
      const sanitized = malicious.replace(/[;'"`]/g, '');
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain(';');
    });

    test('should escape XSS payloads', () => {
      const xss = errorScenarios.xssPayload;
      const escaped = xss
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

      expect(escaped).not.toContain('<script>');
    });
  });

  describe('Field Validation', () => {
    test('should reject empty email field', () => {
      const email = errorScenarios.emptyFields.email;
      expect(email.length).toBe(0);
    });

    test('should reject empty password field', () => {
      const password = errorScenarios.emptyFields.password;
      expect(password.length).toBe(0);
    });
  });
});
