import { api } from './api-client'

interface GetProjectResponse {
  project: {
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
  }
}

export async function getProject(orgSlug: string, projectSlug: string) {
  const result = await api
    .get(`organizations/${orgSlug}/projects/${projectSlug}`)
    .json<GetProjectResponse>()

  return result.project
}
