import { redirect } from 'next/navigation';

// The real, authorization-gated admin surface lives at /dashboard
// (the "Director General Dashboard"). This route previously rendered an
// unauthenticated placeholder with mock data; it now redirects to the
// live dashboard so there is a single source of truth.
export default function AdminPage() {
  redirect('/dashboard');
}
