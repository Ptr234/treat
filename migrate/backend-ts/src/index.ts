import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as Sentry from '@sentry/cloudflare';
import { health } from './routes/health';
import { auth } from './routes/auth';
import { me } from './routes/me';
import { ticketsRoute } from './routes/tickets';
import { documentsRoute } from './routes/documents';
import { uploadRoute } from './routes/upload';
import { messagesRoute } from './routes/messages';
import { fail } from './lib/response';
import type { AppEnv } from './app-env';
import type { Env } from './types';

const app = new Hono<AppEnv>();

// CORS — mirrors Program.cs's AddCors policy (WithOrigins + AllowCredentials).
app.use('*', async (c, next) =>
  cors({
    origin: c.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
    credentials: true,
  })(c, next)
);

// Uniform error shape for anything that escapes a route handler — mirrors
// ExceptionHandlingMiddleware.cs's "never leak a stack trace" behaviour.
app.onError((err, c) => {
  console.error(`[unhandled] ${c.req.method} ${c.req.path}`, err);
  return c.json(fail('Internal server error'), 500);
});

app.notFound((c) => c.json(fail('Not found'), 404));

app.route('/api/health', health);
app.route('/api/auth', auth);
app.route('/api/me', me);
app.route('/api/tickets', ticketsRoute);
app.route('/api/tickets/:refNumber/documents', documentsRoute);
app.route('/api/upload', uploadRoute);
app.route('/api/messages', messagesRoute);

// Remaining slices are mounted here as each resource migrates off ASP.NET —
// see the migration plan's ordering: Investors/Contact next, then Chatbot,
// then the admin surface (Dashboard/Settings/AdminUsers/Audit/Analytics).

export default Sentry.withSentry(
  (envArg: {} | Env | undefined) => {
    const env = envArg as Env | undefined;
    return {
      dsn: env?.SENTRY_DSN,
      tracesSampleRate: 0.2,
      environment: env?.SITE_URL?.includes('localhost') ? 'development' : 'production',
    };
  },
  app
);
