export interface PageQuery {
  page?: number;
  page_size?: number;
}

export interface PageParams {
  limit: number;
  offset: number;
}

export function parsePage(query: PageQuery, defaultPageSize = 12): PageParams {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const pageSize = Math.min(50, Math.max(1, Math.floor(query.page_size ?? defaultPageSize)));
  return { limit: pageSize, offset: (page - 1) * pageSize };
}
