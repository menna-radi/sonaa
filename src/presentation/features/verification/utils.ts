/** t(key) with `{param}` placeholders replaced. */
export const tf = (t: (k: string) => string, key: string, params: Record<string, string | number>): string =>
  Object.entries(params).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t(key));
