// src/app/api/cookies/route.js
import { NextResponse } from 'next/server';
import { cookies as nextCookies } from 'next/headers';

export async function GET() {
  const cookieStore = await nextCookies(); // ✅ await cookies()
  const myCookie = cookieStore.get('myCookie')?.value || 'Not set';

  return NextResponse.json({ cookieValue: myCookie });
}

export async function POST(req) {
  const body = await req.json();

  const res = NextResponse.json({ message: 'Cookie set!' });

  if (body.value) {
    res.cookies.set('myCookie', body.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
  }

  return res;
}
