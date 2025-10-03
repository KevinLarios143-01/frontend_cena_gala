export function extractImageName(filename: string): string {
  if (!filename) return filename;
  
  // Si contiene guión, tomar solo la parte después del último guión
  const parts = filename.split('-');
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  
  return filename;
}