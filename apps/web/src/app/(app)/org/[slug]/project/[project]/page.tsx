'use client'

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ArrowRight } from 'lucide-react'
import { useParams } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getProjectAction } from './actions'

dayjs.extend(relativeTime)

export default function Project() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        const data = await getProjectAction(slug)
        setProject(data)
      } catch (err) {
        setError('Erro ao carregar projeto')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProject()
    }
  }, [slug])

  if (loading) return <p>Carregando...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!project) return <p>Projeto não encontrado</p>

  return (
    <div className="space-y-4 p-4">
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-xl font-medium">{project.name}</CardTitle>
          <CardDescription className="line-clamp-2 leading-relaxed">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center gap-1.5">
          <Avatar className="size-4">
            {project.owner.avatarUrl && (
              <AvatarImage src={project.owner.avatarUrl} />
            )}
            <AvatarFallback />
          </Avatar>

          <span className="truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {project.owner.name}
            </span>{' '}
            {dayjs(project.createdAt).fromNow()}
          </span>

          <Button size="xs" variant="outline" className="ml-auto">
            View <ArrowRight className="ml-2 size-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
