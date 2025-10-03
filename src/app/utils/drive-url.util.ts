export function convertDriveUrl(url: string): string {
  if (!url) return url;
  
  // Si ya está en formato directo, devolverlo tal como está
  if (url.includes('drive.google.com/uc?export=view')) {
    return url.replace('&amp;', '&'); // Limpiar entidades HTML
  }
  
  // Convertir URL de Google Drive al formato directo (con o sin parámetros adicionales)
  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  
  if (match) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url;
}