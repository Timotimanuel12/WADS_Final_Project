export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function ok<T>(data: T, message?: string): Response {
  return Response.json({ success: true, data, ...(message ? { message } : {}) } satisfies ApiResponse<T>);
}

export function created<T>(data: T): Response {
  return Response.json({ success: true, data } satisfies ApiResponse<T>, { status: 201 });
}

export function err(message: string, status = 400): Response {
  return Response.json({ success: false, error: message } satisfies ApiResponse, { status });
}

export function unauthorized(message = "Unauthorized"): Response {
  return err(message, 401);
}

export function forbidden(message = "Forbidden"): Response {
  return err(message, 403);
}

export function notFound(message = "Not found"): Response {
  return err(message, 404);
}
