import { api } from './api-client'

interface SignInWithGoogleResponse {
  token: string
}

export async function signInWithGoogle(code: string): Promise<string> {
  const result = await api
    .post('/sessions/google', {
      json: {
        code,
      },
    })
    .json<SignInWithGoogleResponse>()

  return result.token
}
