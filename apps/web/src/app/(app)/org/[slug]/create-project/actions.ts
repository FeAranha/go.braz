'use server'

import { HTTPError } from 'ky'
import { z } from 'zod'

import { getCurrentOrg } from '@/auth/auth'
import { createProject } from '@/http/create-project'

const projectSchema = z.object({
  name: z
    .string()
    .min(4, { message: 'Please, include at least 4 characters.' }),
  description: z.string(),
  phase: z.enum(['PRELIMINARY', 'STUDY', 'CORRECTION']),
  timelineId: z.string().uuid().optional(),
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
})

export async function createProjectAction(data: FormData) {
  console.log('Received data=>', Object.fromEntries(data))

  const parsedData: { [key: string]: FormDataEntryValue } =
    Object.fromEntries(data)

  const booleanFields = [
    'cityProjectApproved',
    'cndRF',
    'cnoRegistered',
    'isLate',
    'projectInExecution',
    'SEROmeasured',
    'protocolSubmittedToCity',
    'taxesCollected',
  ]

  booleanFields.forEach((field) => {
    if (parsedData[field] === undefined) {
      parsedData[field] = 'false'
    } else if (parsedData[field] === 'on') {
      parsedData[field] = 'true'
    } else if (parsedData[field] === 'off') {
      parsedData[field] = 'false'
    }
  })

  const result = projectSchema.safeParse(parsedData)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    console.error('Validation errors=>', errors)

    return { success: false, message: null, errors }
  }

  const { timeline, ...projectData } = result.data

  try {
    await createProject({
      org: getCurrentOrg()!,
      ...projectData,
      timeline: timeline
        ? {
            startDate: timeline.startDate
              ? new Date(timeline.startDate).toISOString()
              : undefined,
            endDate: timeline.endDate
              ? new Date(timeline.endDate).toISOString()
              : undefined,
          }
        : undefined,
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()

      return { success: false, message, errors: null }
    }

    console.error(err)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes.',
      errors: null,
    }
  }

  return {
    success: true,
    message: 'Successfully saved the project.',
    errors: null,
  }
}
