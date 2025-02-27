'use server'

import { getCurrentOrg } from '@/auth/auth'
import { getProject } from '@/http/get-project'

export async function getProjectAction(slug: string) {
    const currentOrg = getCurrentOrg()
    if (!currentOrg) throw new Error('Organização não encontrada')
  
    const project = await getProject(currentOrg, slug)
    return project
  }