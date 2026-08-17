/**
 * Typed environment variables.
 * All VITE_ vars are strings at runtime — we parse/cast here once.
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  API_TIMEOUT:  Number(import.meta.env.VITE_API_TIMEOUT ?? 10_000),
  /** true  → use in-memory mock repositories (development / demo)
   *  false → use real API repositories */
  USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false',
  IS_DEV:   import.meta.env.DEV === true,
} as const;
