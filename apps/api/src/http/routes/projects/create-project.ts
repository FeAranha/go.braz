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
            cityProjectApproved: z.enum(['true', 'false']),
            cndRF: z.enum(['true', 'false']),
            cnoRegistered: z.enum(['true', 'false']),
            isLate: z.enum(['true', 'false']),
            projectInExecution: z.enum(['true', 'false']),
            SEROmeasured: z.enum(['true', 'false']),
            protocolSubmittedToCity: z.enum(['true', 'false']),
            taxesCollected: z.enum(['true', 'false']),
            timeline: z
              .object({
                startDate: z.string().optional(),
                endDate: z.string().optional(),
              })
              .optional(),
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
          timeline,
        } = request.body

        const project = await prisma.project.create({
          data: {
            name,
            slug: createSlug(name),
            description,
            organizationId: organization.id,
            ownerId: userId,
            phase,
            cityProjectApproved: cityProjectApproved === 'true',
            cndRF: cndRF === 'true',
            cnoRegistered: cnoRegistered === 'true',
            isLate: isLate === 'true',
            projectInExecution: projectInExecution === 'true',
            SEROmeasured: SEROmeasured === 'true',
            protocolSubmittedToCity: protocolSubmittedToCity === 'true',
            taxesCollected: taxesCollected === 'true',
          },
        })

        if (timeline) {
          const createdTimeline = await prisma.timeline.create({
            data: {
              startDate: timeline.startDate
                ? new Date(timeline.startDate)
                : undefined,
              endDate: timeline.endDate
                ? new Date(timeline.endDate)
                : undefined,
            },
          })

          await prisma.project.update({
            where: { id: project.id },
            data: { timelineId: createdTimeline.id },
          })
        }

        return reply.status(201).send({
          projectId: project.id,
        })
      },
    )
}
