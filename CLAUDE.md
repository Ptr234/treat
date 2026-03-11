# CLAUDE Project Directives

This document outlines the core principles and guidelines for developing the Uganda Investment Portal project using Gemini. Adherence to these directives is mandatory to maintain code quality, consistency, and project integrity.

## Core Philosophy
- **Systematic Implementation**: Build the application "Brick by Brick." Each component and feature must be fully implemented, tested, and verified before moving to the next. Do not make assumptions; validate every step.
- **Cultural Relevance**: All design, content, and functionality must be tailored to the Ugandan context. Conduct thorough research to ensure cultural sensitivity and appropriateness.

## Agent & Tooling
- **LLM**: For all LLM queries in this app, we use OpenAI's GPT-4o.

## Development Workflow
1.  **Initial Setup**: Configure and validate the entire development environment (Next.js, TypeScript, ESLint, Tailwind CSS) before writing any application code.
2.  **Routing**: Implement and verify all internal navigation. Ensure all links, buttons, and interactive elements route to the correct pages. Create any necessary placeholder pages.
3.  **Documentation**: Maintain a factual and up-to-date log of all development activities in the `PROGRESS.md` file.

## Code Quality & Conventions
- **Framework**: Next.js with TypeScript.
- **Styling**: Tailwind CSS.
- **Modules**: Use ES modules (`import`/`export`).
- **Branding**: Strictly adhere to the brand color palette: dark green, light green, white, and black.
- **Imagery**: Use sample images that are relevant to the Ugandan context. For placeholders, use creative shapes such as organic curves or geometric patterns.

## Testing & Verification
- **Zero Errors**: The codebase must be free of ESLint, TypeScript, and browser console errors.
- **CI/CD**: All builds must pass continuous integration checks.
- **Dependencies**: Remove any unused packages or dependencies.
- **Accessibility**: Ensure the application complies with WCAG 2.1 AA standards.

## Key Documentation
- **Progress Logs**: `PROGRESS.md`
- **Investment Migration Plan**: `INVESTMENT_MIGRATION_PLAN.md`

## Critical Reminders
- **No Assumptions**: Always verify component integrations, routes, and links.
- **Completeness**: Avoid placeholde

rs (except for images). All features must be fully functional.
- **User-Centric**: Design and build with the end-user (investors and business owners in Uganda) in mind.

## 🔒 Security Best Practices

### Keep your secrets SECRET
- **Environment Variables**: Store API keys, tokens, and other sensitive credentials in environment variables (`.env` files), never in code.
- **Key Rotation**: Rotate all keys and tokens every few months as a security measure.

### Collect less sensitive files
- **Avoid Storing Sensitive Data**: Do not store sensitive user data directly. Use trusted third-party services like Google or Instagram for authentication and profile information where possible.
- **Payment Processing**: Never store raw credit card numbers. Use secure, compliant payment gateways like Stripe or PayPal.

### Use review
- **Sanitize Inputs**:
  - Implement CAPTCHA or reCAPTCHA to prevent automated abuse.
  - Use an SSL certificate (HTTPS) to encrypt all data in transit.
- **Monitor Actively**:
  - Use monitoring services like DataDog, Sentry.io, or your hosting platform's built-in tools to track application performance and security events.
- **Row-Level Security (RLS)**: Implement RLS in your database to ensure users can only access their own data.
- **Update Dependencies**: Regularly update all packages and dependencies to patch security vulnerabilities.
- **Rely on Trusted Providers**: Use well-vetted, reputable third-party libraries and services.