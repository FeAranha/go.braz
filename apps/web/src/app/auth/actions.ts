'use server'

import { env } from '@saas/env'
import { redirect } from 'next/navigation'

export async function signInWithGithub() {
  const githubSignInURL = new URL('login/oauth/authorize', 'https://github.com')

  githubSignInURL.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
  githubSignInURL.searchParams.set(
    'redirect_uri',
    env.GITHUB_OAUTH_CLIENT_REDIRECT_URI,
  )
  githubSignInURL.searchParams.set('scope', 'user')

  redirect(githubSignInURL.toString())
}

export async function signInWithGoogle() {
  const googleSignInUrl = new URL(
    'o/oauth2/v2/auth',
    'https://accounts.google.com',
  )

  googleSignInUrl.searchParams.set('client_id', env.GOOGLE_OAUTH_CLIENT_ID)
  googleSignInUrl.searchParams.set(
    'redirect_uri',
    env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
  )
  googleSignInUrl.searchParams.set('scope', 'profile email') // Scopes comuns para acesso a perfil e email
  googleSignInUrl.searchParams.set('response_type', 'code') // Tipo de resposta esperada
  googleSignInUrl.searchParams.set('access_type', 'offline') // Acesso offline se necessário
  googleSignInUrl.searchParams.set('prompt', 'consent') // Para solicitar consentimento se o token estiver expirado

  redirect(googleSignInUrl.toString())
}
