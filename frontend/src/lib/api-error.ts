import { isAxiosError } from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiErrorResponse } from '@/types'

/** Extrae el ApiErrorResponse del backend de un error de axios, si existe. */
export function getApiError(error: unknown): ApiErrorResponse | null {
  if (isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
    return error.response.data
  }
  return null
}

/** Mensaje legible para mostrar en un toast, con fallback para errores de red/inesperados. */
export function getApiErrorMessage(error: unknown): string {
  const apiError = getApiError(error)
  if (apiError?.message) return apiError.message
  if (isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor'
    return 'Ocurrio un error inesperado'
  }
  return 'Ocurrio un error inesperado'
}

/** HTTP status del error, si es un error de axios con respuesta. */
export function getApiErrorStatus(error: unknown): number | null {
  if (isAxiosError(error) && error.response) return error.response.status
  return null
}

/**
 * Mapea los validationErrors de campo del backend (400 de Bean Validation)
 * a los campos de un formulario de React Hook Form via setError. Devuelve
 * true si encontro y aplico errores de campo (asi el caller sabe si todavia
 * necesita mostrar un toast generico o no).
 */
export function applyValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
): boolean {
  const apiError = getApiError(error)
  if (!apiError?.validationErrors?.length) return false

  for (const fieldError of apiError.validationErrors) {
    setError(fieldError.field as Path<TFieldValues>, { message: fieldError.message })
  }
  return true
}
