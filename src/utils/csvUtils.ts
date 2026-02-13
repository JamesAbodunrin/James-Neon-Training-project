/**
 * Shared CSV parsing utilities. Single source of truth for delimiter and quoted-field handling.
 * Used by fileParser and analysisEngine to avoid duplication and drift.
 */

/** Parse a single line; handles quoted fields and delimiters , \t ; */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      current += c;
    } else if (c === ',' || c === '\t' || c === ';') {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/** Parse CSV text into a 2D array of rows (handles \r\n and empty lines). */
export function parseCSVToRows(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.length > 0);
  return lines.map((line) => parseCSVLine(line));
}

/** Convert parsed rows back to a single CSV string (e.g. for fileParser output). */
export function rowsToCSVString(rows: string[][]): string {
  return rows.map((row) => row.join(',')).join('\n');
}
