import { api } from './api-client'

interface CreateProjectRequest {
  org: string
  name: string
  description: string
  phase: 'PRELIMINARY' | 'STUDY' | 'CORRECTION'
  timelineId?: string
  cityProjectApproved: string
  cndRF: string
  cnoRegistered: string
  isLate: string
  projectInExecution: string
  SEROmeasured: string
  protocolSubmittedToCity: string
  taxesCollected: string
  timeline?: {
    startDate?: string
    endDate?: string
  }
}

type CreateProjectResponse = void

export async function createProject({
  org,
  ...projectData
}: CreateProjectRequest): Promise<CreateProjectResponse> {
  const dataToSend = { ...projectData }

  if (!dataToSend.timelineId) {
    delete dataToSend.timelineId
  }

  await api.post(`organizations/${org}/projects`, {
    json: dataToSend,
  })
}
