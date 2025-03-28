import { api } from './api-client'

interface GetProjectsResponse {
  projects: {
    description: string
    slug: string
    id: string
    name: string
    avatarUrl: string | null
    organizationId: string
    ownerId: string
    createdAt: string
    owner: {
      id: string
      name: string | null
      avatarUrl: string | null
    }
    phase: boolean
    timelineId?: string
    cityProjectApproved: boolean
    cndRF: boolean
    cnoRegistered: boolean
    isLate: boolean
    projectInExecution: boolean
    SEROmeasured: boolean
    protocolSubmittedToCity: boolean
    taxesCollected: boolean
    timeline?: {
      startDate?: string
      endDate?: string
    }
  }[]
}

export async function getProjects(org: string) {
  const result = await api
    .get(`organizations/${org}/projects`)
    .json<GetProjectsResponse>()

  return result
}
