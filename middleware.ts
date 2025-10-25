import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // パスワード認証ページとAPIルートは除外
  if (
    pathname.startsWith('/password') ||
    pathname.startsWith('/api/auth/password') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // パスワード認証のチェック
  const hasAccess = request.cookies.get('app-access')?.value === 'authorized'

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/password', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
