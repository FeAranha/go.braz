import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithGithub } from '@/http/sign-in-with-github'
import { signInWithGoogle } from '@/http/sign-in-with-google'

// Mapeamento de provedores para funções de autenticação
const providerMap: Record<string, (code: string) => Promise<string>> = {
  google: signInWithGoogle,
  github: signInWithGithub,
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const provider = searchParams.get('provider')
  const code = searchParams.get('code')

  if (!code) {
    return new NextResponse('Missing code', { status: 400 })
  }

  const signInFunction = provider ? providerMap[provider] : undefined

  if (!signInFunction) {
    return new NextResponse('Invalid provider', { status: 400 })
  }

  const token = await signInFunction(code)
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
}
