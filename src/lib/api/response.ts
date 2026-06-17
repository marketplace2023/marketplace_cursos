export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  meta?: Record<string, unknown>
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}

export function ok<T>(data: T, message = 'OK', meta?: Record<string, unknown>): Response {
  return Response.json({ success: true, message, data, meta } satisfies ApiResponse<T>)
}

export function created<T>(data: T, message = 'Created'): Response {
  return Response.json({ success: true, message, data } satisfies ApiResponse<T>, { status: 201 })
}

export function noContent(): Response {
  return new Response(null, { status: 204 })
}

export function badRequest(message = 'Bad request', details?: unknown[]): Response {
  return Response.json({
    success: false,
    error: { code: 'BAD_REQUEST', message, details },
  } satisfies ApiError, { status: 400 })
}

export function unauthorized(message = 'Unauthorized'): Response {
  return Response.json({
    success: false,
    error: { code: 'UNAUTHORIZED', message },
  } satisfies ApiError, { status: 401 })
}

export function forbidden(message = 'Forbidden'): Response {
  return Response.json({
    success: false,
    error: { code: 'FORBIDDEN', message },
  } satisfies ApiError, { status: 403 })
}

export function notFound(message = 'Not found'): Response {
  return Response.json({
    success: false,
    error: { code: 'NOT_FOUND', message },
  } satisfies ApiError, { status: 404 })
}

export function conflict(message = 'Conflict'): Response {
  return Response.json({
    success: false,
    error: { code: 'CONFLICT', message },
  } satisfies ApiError, { status: 409 })
}

export function serverError(message = 'Internal server error'): Response {
  return Response.json({
    success: false,
    error: { code: 'SERVER_ERROR', message },
  } satisfies ApiError, { status: 500 })
}

/* pagination meta helper */
export function pageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
    has_next: page * limit < total,
    has_prev: page > 1,
  }
}
