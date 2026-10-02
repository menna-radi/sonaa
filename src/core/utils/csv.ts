/** Quote every cell, double inner quotes, join with CRLF, prefix BOM. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return String.fromCharCode(0xfeff) + rows.map((r) => r.map(esc).join(',')).join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
