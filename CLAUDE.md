use Gemini cli for analysis and planning then claude should implement

# Development Environment Setup

## Prerequisites
- Node.js >= 18.0.0 (current: v22.17.1 ✅)
- npm >= 8.0.0 (current: v10.9.2 ✅)

## Project Structure
- `angular-frontend/` - Angular 20.2.0 frontend application
- `backend/` - Node.js/Express backend with PostgreSQL/SQLite support
- Root package.json provides monorepo script management

## Available Commands
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build Angular frontend for production
- `npm run lint` - Run ESLint on Angular frontend
- `npm run test` - Run Angular tests with Puppeteer Chrome
- `npm run test:ci` - Run tests with coverage for CI/CD

## Notes
- Backend falls back to mock database when PostgreSQL not configured
- Tests use Puppeteer Chrome for headless testing
- ESLint configured for Angular with strict TypeScript rules