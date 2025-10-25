import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.ACCESS_PASSWORD

    if (!correctPassword) {
      return NextResponse.json(
        { error: 'パスワードが設定されていません' },
        { status: 500 }
      )
    }

    if (password === correctPassword) {
      // パスワードが正しい場合、Cookieを設定
      const cookieStore = await cookies()
      cookieStore.set('app-access', 'authorized', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7日間
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Password auth error:', error)
    return NextResponse.json(
      { error: '認証に失敗しました' },
      { status: 500 }
    )
  }
}
