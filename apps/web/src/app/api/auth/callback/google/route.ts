import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithGoogle } from '@/http/sign-in-with-google'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')

  if (!code) {
    return new NextResponse('Missing code', { status: 400 })
  }

  try {
    const { token } = await signInWithGoogle({ code })

    cookies().set('token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 })

    const inviteId = cookies().get('inviteId')?.value
    if (inviteId) {
      try {
        await acceptInvite(inviteId)
        cookies().delete('inviteId')
      } catch (error) {
        console.error('Failed to accept invite:', error)
      }
    }

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.search = ''

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Authentication failed:', error)
    return new NextResponse('Authentication failed', { status: 500 })
  }
}
