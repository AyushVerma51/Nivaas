/**
 * Consistent response envelope for the Atlas API.
 *   success: { success: true,  data, meta? }
 *   error:   { success: false, error: { code, message, details? } }
 */

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ok<T>(data: T, meta?: Meta) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function pageMeta(page: number, limit: number, total: number): Meta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/** Parse & clamp pagination query params. */
export function pagination(query: {
  page?: string;
  limit?: string;
}): { page: number; limit: number } {
  const rawPage = Number.parseInt(query.page ?? "1", 10);
  const rawLimit = Number.parseInt(query.limit ?? "20", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;
  return { page, limit };
}
