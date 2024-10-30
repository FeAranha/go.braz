import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function authenticateWithGoogle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/google',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with Google',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const googleOAuthURL = new URL('https://oauth2.googleapis.com/token')
      const googleOAuthBody = new URLSearchParams()

      googleOAuthBody.set('client_id', env.GOOGLE_OAUTH_CLIENT_ID)
      googleOAuthBody.set('client_secret', env.GOOGLE_OAUTH_CLIENT_SECRET)
      googleOAuthBody.set('redirect_uri', env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI)
      googleOAuthBody.set('grant_type', 'authorization_code')
      googleOAuthBody.set('code', code)

      const googleAccessTokenResponse = await fetch(googleOAuthURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: googleOAuthBody.toString(),
      })

      const googleAccessTokenData = await googleAccessTokenResponse.json()

      const { access_token: googleAccessToken } = z
        .object({
          access_token: z.string(),
          expires_in: z.number(),
          token_type: z.literal('Bearer'),
        })
        .parse(googleAccessTokenData)

      const googleUserResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        },
      )

      const googleUserData = await googleUserResponse.json()

      const {
        id: googleId,
        name,
        email,
        picture: avatarUrl,
      } = z
        .object({
          id: z.string(),
          name: z.string().nullable(),
          email: z.string().nullable(),
          picture: z.string().url().nullable(),
        })
        .parse(googleUserData)

      if (email === null) {
        throw new BadRequestError(
          'Your Google account must have an email to authenticate.',
        )
      }

      let user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            avatarUrl,
          },
        })
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_userId: {
            provider: 'GOOGLE',
            userId: user.id,
          },
        },
      })

      if (!account) {
        account = await prisma.account.create({
          data: {
            provider: 'GOOGLE',
            providerAccountId: googleId,
            userId: user.id,
          },
        })
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
