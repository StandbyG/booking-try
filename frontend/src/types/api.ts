/** Espejo de com.portfolio.booking.dto.response.ErrorResponse del backend. */
export interface FieldValidationError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  validationErrors: FieldValidationError[] | null
}
