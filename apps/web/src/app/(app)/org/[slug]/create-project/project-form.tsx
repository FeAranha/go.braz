'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import Image from 'next/image'
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

type CheckboxState = {
  cityProjectApproved?: string
  cndRF?: string
  cnoRegistered?: string
  isLate?: string
  projectInExecution?: string
  SEROmeasured?: string
  protocolSubmittedToCity?: string
  taxesCollected?: string
}

const checkboxLabels: Record<keyof CheckboxState, string> = {
  cityProjectApproved: 'City Project Approved',
  cndRF: 'CND RF',
  cnoRegistered: 'CNO Registered',
  isLate: 'Is Late',
  projectInExecution: 'Project In Execution',
  SEROmeasured: 'SERO Measured',
  protocolSubmittedToCity: 'Protocol Submitted To City',
  taxesCollected: 'Taxes Collected',
}

export function ProjectForm() {
  const { slug: org } = useParams<{ slug: string }>()

  const [formState, handleSubmit, isPending] = useFormState(
    createProjectAction,
    () => {
      queryClient.invalidateQueries({
        queryKey: [org, 'projects'],
      })
    },
  )

  const { errors, message, success } = formState

  const [checkboxState, setCheckboxState] = useState<CheckboxState>(
    Object.keys(checkboxLabels).reduce((acc, key) => {
      acc[key as keyof CheckboxState] = 'false'
      return acc
    }, {} as CheckboxState),
  )

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    setCheckboxState((prev) => ({ ...prev, [name]: checked.toString() }))
  }

  const handleSubmitWithValidation = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()

    const formElement = e.currentTarget

    try {
      const formData = new FormData(formElement)

      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        phase: formData.get('phase') as string,
        timeline: {
          startDate: formData.get('timeline[startDate]') as string,
          endDate: formData.get('timeline[endDate]') as string,
        },
        ...checkboxState,
      }

      await handleSubmit(e)
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
    }
  }

  return (
    <form onSubmit={handleSubmitWithValidation} className="space-y-4">
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

      <Image
        src="/_next/static/media/rocketseat-icon.c712abd7.svg"
        alt="Rocketseat Icon"
        width={50}
        height={50}
        style={{ objectFit: 'contain' }}
      />

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
          <label key={key} htmlFor={key}>
            <input
              className="mr-2"
              type="checkbox"
              name={key}
              id={key}
              checked={checkboxState[key as keyof CheckboxState] === 'true'}
              onChange={handleCheckboxChange}
            />
            {checkboxLabels[key as keyof CheckboxState]}
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
