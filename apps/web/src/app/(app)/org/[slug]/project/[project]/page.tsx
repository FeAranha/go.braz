'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ArrowRight } from 'lucide-react'
import { useParams } from 'next/navigation'

import { getCurrentOrg } from '@/auth/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getProject } from '@/http/get-project'

dayjs.extend(relativeTime)

export default async function Project() {
  const { slug } = useParams<{
    slug: string
    project: string
  }>()
  const currentOrg = getCurrentOrg()
  const project = await getProject(currentOrg!, slug)

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
