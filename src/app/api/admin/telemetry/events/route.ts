import { validateSession } from '@/lib/admin-auth';
import { getEvents } from '@/lib/telemetry';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token || !validateSession(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const since = searchParams.get('since') || undefined;

  const events = getEvents(since);
  const limited = events.slice(-limit).reverse();

  return Response.json({ events: limited, total: events.length });
}
