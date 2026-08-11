export function countWords(title: string): number {
  return title
    .trim()
    .split(/\s+/)
    .filter((token) => /[A-Za-z0-9]/.test(token)).length;
}
