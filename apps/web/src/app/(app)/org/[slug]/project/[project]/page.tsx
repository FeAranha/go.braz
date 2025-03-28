'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { getProjectAction } from './actions'

dayjs.extend(relativeTime)

interface ProjectProps {
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
}

export default function Project() {
  const { slug, project } = useParams<{ slug: string; project: string }>()
  const [projectData, setProjectData] = useState<ProjectProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        const data = await getProjectAction(slug, project)
        setProjectData(data)
      } catch (err) {
        setError('Erro ao carregar projeto')
      } finally {
        setLoading(false)
      }
    }

    if (slug && project) {
      fetchProject()
    }
  }, [slug, project])

  if (loading) return <p>Carregando...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!projectData) return <p>Projeto não encontrado</p>
  console.log('projectData=>', projectData)
  return (
    <div className="space-y-4 p-4">
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            {projectData.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 leading-relaxed">
            {projectData.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Fase:</span>
            <span className="text-xs font-medium">
              {projectData.phase ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Cidade:</span>
            <span className="text-xs font-medium">São Paulo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Atrasado:</span>
            <span className="text-xs font-medium">
              {projectData.isLate ? 'Sim' : 'Não'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Em execução:</span>
            <span className="text-xs font-medium">
              {projectData.projectInExecution ? 'Sim' : 'Não'}
            </span>
          </div>
          sero:
          {projectData.SEROmeasured ? ' Sim' : ' Não'}
        </CardContent>
        <CardFooter className="flex items-center gap-1.5">
          <Avatar className="size-4">
            {projectData.owner.avatarUrl && (
              <AvatarImage src={projectData.owner.avatarUrl} />
            )}
            <AvatarFallback />
          </Avatar>

          <span className="truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {projectData.owner.name}
            </span>{' '}
            {dayjs(projectData.createdAt).fromNow()}
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}
