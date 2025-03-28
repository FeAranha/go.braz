'use server'

import { getCurrentOrg } from '@/auth/auth'
import { getProject } from '@/http/get-project'

export async function getProjectAction(orgSlug: string, projectSlug: string) {
  const currentOrg = getCurrentOrg()

  if (!currentOrg) {
    console.error('Organização não encontrada')
    throw new Error('Organização não encontrada')
  }

  try {
    const project = await getProject(currentOrg, projectSlug)
    console.log('project=>', project)
    return project
  } catch (error) {
    console.log(error)
    throw error
  }
}
