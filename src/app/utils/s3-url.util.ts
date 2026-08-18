/** Detecta peticiones HTTP dirigidas a URLs pre-firmadas de S3. */
export function isS3PresignedRequest(url: string): boolean {
  if (!url) {
    return false;
  }
  return (
    /\.s3[.-][a-z0-9-]+\.amazonaws\.com/i.test(url) ||
    /X-Amz-Signature/i.test(url) ||
    /X-Amz-Algorithm/i.test(url)
  );
}

/** Normaliza la respuesta de generar-url (string legacy u objeto estructurado). */
export function parsePresignUploadData(data: unknown): {
  presigned_url: string;
  s3_key: string;
  location: string;
  file_type?: string;
} {
  if (typeof data === 'string') {
    return { presigned_url: data, s3_key: '', location: '' };
  }
  if (!data || typeof data !== 'object') {
    return { presigned_url: '', s3_key: '', location: '' };
  }
  const obj = data as Record<string, unknown>;
  const presigned_url = String(
    obj['presigned_url'] ??
      obj['presignedUrl'] ??
      obj['url_presignada'] ??
      obj['url'] ??
      obj['upload_url'] ??
      ''
  );
  return {
    presigned_url,
    s3_key: String(obj['s3_key'] ?? obj['s3Key'] ?? ''),
    location: String(obj['location'] ?? ''),
    file_type: obj['file_type'] != null ? String(obj['file_type']) : undefined,
  };
}

/** Errores HTTP que ameritan reintento en subida a S3. */
export function isRetryableUploadError(status: number): boolean {
  return status === 0 || status === 429 || (status >= 500 && status <= 599);
}
