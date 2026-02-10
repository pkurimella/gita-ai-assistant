import { validatePassword, createSession, destroySession, validateSession } from '@/lib/admin-auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password || !validatePassword(password)) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = createSession();

    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (token) {
      destroySession(token);
    }

    cookieStore.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
