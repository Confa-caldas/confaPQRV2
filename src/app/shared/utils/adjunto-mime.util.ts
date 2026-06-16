const EXTENSIONES_ADJUNTO_BASE = ['.pdf', '.png', '.jpeg', '.jpg'];
const EXTENSIONES_PERMISO_TRABAJO = [...EXTENSIONES_ADJUNTO_BASE, '.docx'];

const MIME_ADJUNTO_BASE = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MIME_PERMISO_TRABAJO = [
  ...MIME_ADJUNTO_BASE,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function extensionAdjuntoPermitida(nombreArchivo: string, permitirDocx = false): boolean {
  const name = (nombreArchivo ?? '').toLowerCase().trim();
  const ext = name.includes('.') ? name.substring(name.lastIndexOf('.')) : '';
  const allowed = permitirDocx ? EXTENSIONES_PERMISO_TRABAJO : EXTENSIONES_ADJUNTO_BASE;
  return allowed.includes(ext);
}

export function mimeAdjuntoPermitido(file: File, permitirDocx = false): boolean {
  const type = (file.type ?? '').toLowerCase().trim();
  if (!type) {
    return extensionAdjuntoPermitida(file.name, permitirDocx);
  }
  const allowed = permitirDocx ? MIME_PERMISO_TRABAJO : MIME_ADJUNTO_BASE;
  return allowed.includes(type);
}

export const MENSAJE_TIPO_ADJUNTO_NO_PERMITIDO =
  'Formato de archivo no permitido. Use PDF, PNG o JPG (DOCX solo en permiso de trabajo).';
