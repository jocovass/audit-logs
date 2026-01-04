export interface PaginationOptions {
  cursor?: string; // UUID v7 of last item (cursor-based pagination)
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
