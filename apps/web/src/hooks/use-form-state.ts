import { useState, useTransition } from 'react'
import { requestFormReset } from 'react-dom'

interface FormState {
  success: boolean
  message: string | null
  errors: Record<string, string[]> | null
}

export function useFormState(
  action: (data: FormData) => Promise<FormState>,
  onSuccess?: () => Promise<void> | void,
  initialState?: FormState,
) {
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState(
    initialState ?? { success: false, message: null, errors: null },
  )

  async function handleSubmit(data: FormData) {
    startTransition(async () => {
      try {
        const state = await action(data)
        if (state.success && onSuccess) {
          await onSuccess()
        }
        setFormState(state)
      } catch (error) {
        console.error('Erro ao enviar o formulário:', error)
        setFormState({
          success: false,
          message: 'Falha ao enviar o formulário.',
          errors: { general: ['Erro inesperado. Tente novamente.'] },
        })
      }
    })

    const form = document.querySelector('form')
    if (form) requestFormReset(form)
  }

  return [formState, handleSubmit, isPending] as const
}
