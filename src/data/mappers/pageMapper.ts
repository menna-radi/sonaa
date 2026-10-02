export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function toPage<R, T>(
  raw: unknown,
  page: number,
  limit: number,
  map: (r: R) => T,
  filter?: (t: T) => boolean
): Page<T> {
  const arr: R[] = Array.isArray(raw) ? (raw as R[]) : ((raw as { items?: R[] })?.items ?? []);
  const mapped = arr.map(map);
  if (Array.isArray(raw)) {
    // legacy unpaginated endpoint → paginate on the client
    const f = filter ? mapped.filter(filter) : mapped;
    return { items: f.slice((page - 1) * limit, page * limit), total: f.length, page, limit };
  }
  const total = (raw as { total?: number })?.total ?? mapped.length;
  return { items: mapped, total, page, limit };
}
