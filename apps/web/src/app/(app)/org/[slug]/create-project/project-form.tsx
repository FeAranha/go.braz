'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useFormState } from '@/hooks/use-form-state'
import { queryClient } from '@/lib/react-query'

import { createProjectAction } from './actions'

export function ProjectForm() {
  const { slug: org } = useParams<{ slug: string }>()

  const [{ errors, message, success }, handleSubmit, isPending] = useFormState(
    createProjectAction,
    () => {
      queryClient.invalidateQueries({
        queryKey: [org, 'projects'],
      })
    },
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success === false && message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Save project failed!</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}

      {success === true && message && (
        <Alert variant="success">
          <AlertTriangle className="size-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="name">Project name</Label>
        <Input name="name" id="name" />

        {errors?.name && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {errors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea name="description" id="description" />

        {errors?.description && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {errors.description[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="phase">Phase: </Label>
        <select className="text-sm" name="phase" id="phase">
          <option value="PRELIMINARY">Preliminary</option>
          <option value="STUDY">Study</option>
          <option value="CORRECTION">Correction</option>
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="timelineId">Timeline ID (Optional)</Label>
        <Input
          name="timelineId"
          id="timelineId"
          placeholder="Enter timeline ID"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label>
          <input className="mr-2" type="checkbox" name="cityProjectApproved" />
          City Project Approved
        </label>
        <label>
          <input className="mr-2" type="checkbox" name="cndRF" />
          CND RF
        </label>
        <label>
          <input className="mr-2" type="checkbox" name="cnoRegistered" />
          CNO Registered
        </label>
        <label>
          <input className="mr-2" type="checkbox" name="isLate" />
          Is Late
        </label>
        <label>
          <input className="mr-2" type="checkbox" name="projectInExecution" />
          Project In Execution
        </label>
        <label>
          <input className="mr-2" type="checkbox" name="SEROmeasured" />
          SERO Measured
        </label>
        <label>
          <input
            className="mr-2"
            type="checkbox"
            name="protocolSubmittedToCity"
          />
          Protocol Submitted to City
        </label>
        <label>
          <input className="mr-2" type="checkbox" name="taxesCollected" />
          Taxes Collected
        </label>
      </div>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          'Save project'
        )}
      </Button>
    </form>
  )
}
