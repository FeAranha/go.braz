'use client'

import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useFormState } from '@/hooks/use-form-state'
import { queryClient } from '@/lib/react-query'

import { createProjectAction } from './actions'

const ProjectFormSchema = zfd.formData({
  name: zfd.text(z.string().min(1, 'Project name is required')),
  description: zfd.text(z.string().min(1, 'Description is required')),
  phase: zfd.text(z.enum(['PRELIMINARY', 'STUDY', 'CORRECTION'])),
  timelineStartDate: zfd.text(z.string().optional()),
  timelineEndDate: zfd.text(z.string().optional()),
  cityProjectApproved: zfd.checkbox(),
  cndRF: zfd.checkbox(),
  cnoRegistered: zfd.checkbox(),
  isLate: zfd.checkbox(),
  projectInExecution: zfd.checkbox(),
  SEROmeasured: zfd.checkbox(),
  protocolSubmittedToCity: zfd.checkbox(),
  taxesCollected: zfd.checkbox(),
})

const checkboxLabels = {
  cityProjectApproved: 'City Project Approved',
  cndRF: 'CND RF',
  cnoRegistered: 'CNO Registered',
  isLate: 'Is Late',
  projectInExecution: 'Project In Execution',
  SEROmeasured: 'SERO Measured',
  protocolSubmittedToCity: 'Protocol Submitted To City',
  taxesCollected: 'Taxes Collected',
} as const

export function ProjectForm() {
  const { slug: org } = useParams<{ slug: string }>()
  const [formState, setFormState] = useState({
    success: false,
    message: '',
    errors: {} as Record<string, string>,
  })

  const [submitHandler, isPending] = useFormState(
    async (formData: FormData) => {
      const result = await createProjectAction(formData)
      return result // Retorna o `FormState` esperado
    },
    () => {
      queryClient.invalidateQueries({ queryKey: [org, 'projects'] })
    },
  )

  const handleSubmitWithValidation = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const parsedData = Object.fromEntries(formData.entries())
      const booleanFields = [
        'cityProjectApproved',
        'cndRF',
        'cnoRegistered',
        'isLate',
        'projectInExecution',
        'SEROmeasured',
        'protocolSubmittedToCity',
        'taxesCollected',
      ]

      booleanFields.forEach((field) => {
        parsedData[field] = formData.get(field) === 'on' ? 'true' : 'false'
      })

      const validatedData = ProjectFormSchema.parse(parsedData)

      const preparedFormData = new FormData()
      Object.entries(validatedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          preparedFormData.append(key, value.toString())
        }
      })

      const result = await submitHandler(preparedFormData)

      setFormState({
        success: result.success,
        message: result.message,
        errors: result.errors,
      })
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        for (const key in err.flatten().fieldErrors) {
          const fieldError = err.flatten().fieldErrors[key]
          if (fieldError && fieldError.length > 0) {
            errors[key] = fieldError[0]
          }
        }

        setFormState({
          success: false,
          message: 'Validation errors occurred.',
          errors,
        })
      } else {
        setFormState({
          success: false,
          message: 'Unexpected error occurred.',
          errors: {},
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmitWithValidation} className="space-y-6">
      {formState.message && (
        <Alert variant={formState.success ? 'success' : 'destructive'}>
          <AlertTitle>{formState.success ? 'Success!' : 'Error'}</AlertTitle>
          <AlertDescription>{formState.message}</AlertDescription>
        </Alert>
      )}

      <FormField
        id="name"
        label="Project Name"
        type="text"
        error={formState.errors.name}
      />
      <FormField
        id="description"
        label="Description"
        type="textarea"
        error={formState.errors.description}
      />
      <FormField
        id="phase"
        label="Phase"
        type="select"
        options={[
          { value: 'PRELIMINARY', label: 'Preliminary' },
          { value: 'STUDY', label: 'Study' },
          { value: 'CORRECTION', label: 'Correction' },
        ]}
      />
      <FormField
        id="timelineStartDate"
        label="Timeline Start Date (Optional)"
        type="date"
      />
      <FormField
        id="timelineEndDate"
        label="Timeline End Date (Optional)"
        type="date"
      />

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(checkboxLabels).map(([key, label]) => (
          <label key={key} htmlFor={key}>
            <input type="checkbox" id={key} name={key} className="mr-2" />
            {label}
          </label>
        ))}
      </div>

      <Button type="submit" disabled={!!isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : 'Save Project'}
      </Button>
    </form>
  )
}

function FormField({
  id,
  label,
  type,
  options,
  error,
}: {
  id: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'select'
  options?: { value: string; label: string }[]
  error?: string
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {type === 'textarea' ? (
        <Textarea id={id} name={id} />
      ) : type === 'select' ? (
        <select id={id} name={id} className="text-sm">
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input type={type} id={id} name={id} />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
