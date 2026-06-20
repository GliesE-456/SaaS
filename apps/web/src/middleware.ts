import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

const publicRoutes = ['/', '/pricing', '/sign-in', '/sign-up', '/verify-email', '/changelog', '/about'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude public routes and static assets
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/demo/') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Dashboard / API routes
  const session = await auth();

  if (!session) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
