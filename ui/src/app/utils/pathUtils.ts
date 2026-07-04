export function getPathParts(path?: string | string[]): string[] {
  if (Array.isArray(path)) {
    return path;
  }
  if (typeof path === 'string') {
    return path.split(/[\/$]/).filter((s: string) => s.length > 0);
  }
  return [];
}
