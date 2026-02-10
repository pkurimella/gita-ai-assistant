import { validateSession } from '@/lib/admin-auth';
import { getSummary } from '@/lib/telemetry';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token || !validateSession(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = getSummary();
  return Response.json(summary);
}
