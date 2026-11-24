const QUOTE = '"';
const SEPARATOR = ',';

export function parseCsv(text: string): Record<string, string>[] {
  const [header, ...rows] = text.split(/\r?\n/).filter(line => line.length > 0).map(parseCsvLine);
  if (!header) return [];
  return rows.map(row => Object.fromEntries(header.map((column, i) => [column, row[i] ?? ''])));
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let isQuoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === QUOTE && isQuoted && line[i + 1] === QUOTE) {
      field += QUOTE;
      i++;
    } else if (char === QUOTE) {
      isQuoted = !isQuoted;
    } else if (char === SEPARATOR && !isQuoted) {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }

  fields.push(field);
  return fields;
}
