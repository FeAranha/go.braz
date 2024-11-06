'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

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

  // State para checkboxes
  const [checkboxState, setCheckboxState] = useState({
    cityProjectApproved: false,
    cndRF: false,
    cnoRegistered: false,
    isLate: false,
    projectInExecution: false,
    SEROmeasured: false,
    protocolSubmittedToCity: false,
    taxesCollected: false,
  })

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    setCheckboxState((prev) => ({ ...prev, [name]: checked }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <Alert variant={success ? 'success' : 'destructive'}>
          <AlertTriangle className="size-4" />
          <AlertTitle>
            {success ? 'Success!' : 'Save project failed!'}
          </AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="name">Project Name</Label>
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
        <Label htmlFor="phase">Phase:</Label>
        <select className="text-sm" name="phase" id="phase">
          <option value="PRELIMINARY">Preliminary</option>
          <option value="STUDY">Study</option>
          <option value="CORRECTION">Correction</option>
        </select>
      </div>

      {/* Timeline fields for optional start and end dates */}
      <div className="space-y-1">
        <Label htmlFor="timelineStartDate">
          Timeline Start Date (Optional)
        </Label>
        <Input type="date" name="timeline[startDate]" id="timelineStartDate" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="timelineEndDate">Timeline End Date (Optional)</Label>
        <Input type="date" name="timeline[endDate]" id="timelineEndDate" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.keys(checkboxState).map((key) => (
          <label key={key}>
            <input
              className="mr-2"
              type="checkbox"
              name={key}
              checked={checkboxState[key as keyof typeof checkboxState]}
              onChange={handleCheckboxChange}
            />
            {key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())}
          </label>
        ))}
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
