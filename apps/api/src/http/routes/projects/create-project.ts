import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/projects',
      {
        schema: {
          tags: ['Projects'],
          summary: 'Create a new project',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            description: z.string(),
            phase: z.enum(['PRELIMINARY', 'STUDY', 'CORRECTION']),
            cityProjectApproved: z.boolean(),
            cndRF: z.boolean(),
            cnoRegistered: z.boolean(),
            isLate: z.boolean(),
            projectInExecution: z.boolean(),
            SEROmeasured: z.boolean(),
            protocolSubmittedToCity: z.boolean(),
            taxesCollected: z.boolean(),
            timelineId: z.string().uuid(),
            // timeline: z
            //   .object({
            //     startDate: z.string().optional(),
            //     endDate: z.string().optional(),
            //   })
            //   .optional(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              projectId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Project')) {
          throw new UnauthorizedError(
            `You're not allowed to create new projects.`,
          )
        }

        const {
          name,
          description,
          phase,
          cityProjectApproved,
          cndRF,
          cnoRegistered,
          isLate,
          projectInExecution,
          SEROmeasured,
          protocolSubmittedToCity,
          taxesCollected,
          timelineId,
        } = request.body

        const project = await prisma.project.create({
          data: {
            name,
            slug: createSlug(name),
            description,
            organizationId: organization.id,
            ownerId: userId,
            phase,
            cityProjectApproved,
            cndRF,
            cnoRegistered,
            isLate,
            projectInExecution,
            SEROmeasured,
            protocolSubmittedToCity,
            taxesCollected,
            timelineId,
            // timeline: timeline
            //   ? {
            //       create: {
            //         startDate: timeline.startDate
            //           ? new Date(timeline.startDate)
            //           : undefined,
            //         endDate: timeline.endDate
            //           ? new Date(timeline.endDate)
            //           : undefined,
            //       },
            //     }
            //   : undefined,
          },
        })

        return reply.status(201).send({
          projectId: project.id,
        })
      },
    )
}
