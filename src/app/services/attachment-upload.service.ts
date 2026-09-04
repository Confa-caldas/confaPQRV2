import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { firstValueFrom, lastValueFrom, throwError } from 'rxjs';
import { catchError, delay, filter, retryWhen, take, tap } from 'rxjs/operators';

import { Users } from './users.service';
import {
  Adjunto,
  ApplicantAttachments,
  ErrorAttachLog,
  PresignAdjuntoAdicionalData,
} from '../models/users.interface';
import { isRetryableUploadError, parsePresignUploadData } from '../utils/s3-url.util';

export type PqrsAttachmentOwner =
  | 'applicant'
  | 'assigned'
  | 'pending'
  | 'pending_ext'
  | 'additional';

export type UploadPhase = 'presign' | 'upload' | 'confirm';

export interface UploadProgressEvent {
  fileName: string;
  phase: UploadPhase;
  percent?: number;
}

export interface BatchUploadResult {
  succeeded: string[];
  failed: Array<{ fileName: string; error: string }>;
}

export interface PqrsUploadOptions {
  onProgress?: (event: UploadProgressEvent) => void;
  onUploadError?: (file: ApplicantAttachments, requestId: number, error: HttpErrorResponse) => void;
  presignRetries?: number;
  uploadRetries?: number;
  confirmRetries?: number;
  retryDelayMs?: number;
}

export interface AfiliationAdditionalUploadOptions {
  idPersona: number;
  idTipoAdjunto?: number | string | null;
  presignRetries?: number;
  uploadRetries?: number;
  confirmRetries?: number;
  retryDelayMs?: number;
  onProgress?: (event: UploadProgressEvent) => void;
}

export interface PqrsPresignMetadata {
  presigned_url: string;
  s3_key: string;
  location: string;
}

/** Error de subida PQRS; incluye metadatos del presign si falló el PUT a S3. */
export class PqrsUploadError extends Error {
  constructor(
    message: string,
    readonly phase: UploadPhase,
    readonly presign?: PqrsPresignMetadata
  ) {
    super(message);
    this.name = 'PqrsUploadError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class AttachmentUploadService {
  private static readonly DEFAULT_RETRIES = 3;
  private static readonly DEFAULT_DELAY_MS = 2000;

  constructor(
    private readonly http: HttpClient,
    private readonly users: Users
  ) {}

  async retry<T>(
    operation: () => Promise<T>,
    retries = AttachmentUploadService.DEFAULT_RETRIES,
    delayMs = AttachmentUploadService.DEFAULT_DELAY_MS
  ): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Todos los intentos fallaron');
  }

  /** PUT directo a S3 con reintentos y validación de respuesta 200. */
  async putFileToS3(
    presignedUrl: string,
    file: File | Blob,
    contentType: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    const upload$ = this.http
      .put(presignedUrl, file, {
        headers: { 'Content-Type': contentType },
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        tap(event => {
          if (event.type === HttpEventType.UploadProgress && onProgress) {
            const total = event.total || (file instanceof File ? file.size : 0) || 1;
            onProgress(Math.round((event.loaded / total) * 100));
          }
        }),
        retryWhen(errors =>
          errors.pipe(
            tap((error: HttpErrorResponse) => {
              if (!isRetryableUploadError(error.status ?? 0)) {
                throw error;
              }
            }),
            delay(AttachmentUploadService.DEFAULT_DELAY_MS),
            take(AttachmentUploadService.DEFAULT_RETRIES)
          )
        ),
        filter((event): event is HttpResponse<Object> => event instanceof HttpResponse),
        tap(response => {
          if (response.status !== 200) {
            throw new Error(`S3 respondió con estado ${response.status}`);
          }
        }),
        catchError(err => throwError(() => err))
      );

    await lastValueFrom(upload$);
  }

  private buildPqrsPresignPayload(file: ApplicantAttachments, requestId: number) {
    return {
      source_name: (file.source_name ?? '').replace(/(?!\.[^.]+$)\./g, '_'),
      fileweight: file.fileweight,
      request_id: requestId,
      content_type: file.file?.type || 'application/octet-stream',
    };
  }

  /** Flujo completo PQRS: presign → PUT S3 → confirm BD. */
  async uploadPqrsFile(
    file: ApplicantAttachments,
    requestId: number,
    owner: PqrsAttachmentOwner,
    options: PqrsUploadOptions = {}
  ): Promise<void> {
    if (!file?.file) {
      throw new Error('El archivo no es válido.');
    }

    const fileName = file.source_name ?? file.file.name;
    const contentType = file.file.type || 'application/octet-stream';
    const presignRetries = options.presignRetries ?? AttachmentUploadService.DEFAULT_RETRIES;
    const uploadRetries = options.uploadRetries ?? AttachmentUploadService.DEFAULT_RETRIES;
    const confirmRetries = options.confirmRetries ?? AttachmentUploadService.DEFAULT_RETRIES;
    const retryDelayMs = options.retryDelayMs ?? AttachmentUploadService.DEFAULT_DELAY_MS;

    options.onProgress?.({ fileName, phase: 'presign' });

    const presignResponse = await this.retry(async () => {
      const response = await firstValueFrom(
        this.users.getUrlSigned(this.buildPqrsPresignPayload(file, requestId), owner)
      );
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || 'No se pudo obtener la URL prefirmada');
      }
      return parsePresignUploadData(response.data);
    }, presignRetries, retryDelayMs);

    if (!presignResponse.presigned_url) {
      throw new Error('La respuesta no incluye presigned_url');
    }

    file.preSignedUrl = presignResponse.presigned_url;

    options.onProgress?.({ fileName, phase: 'upload', percent: 0 });

    try {
      await this.retry(
        () =>
          this.putFileToS3(presignResponse.presigned_url, file.file!, contentType, percent =>
            options.onProgress?.({ fileName, phase: 'upload', percent })
          ),
        uploadRetries,
        retryDelayMs
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && options.onUploadError) {
        options.onUploadError(file, requestId, error);
      }
      const message = error instanceof Error ? error.message : 'Falló la subida a S3';
      throw new PqrsUploadError(message, 'upload', this.toPresignMetadata(presignResponse));
    }

    if (!presignResponse.s3_key || !presignResponse.location) {
      throw new Error('La respuesta de presign no incluye s3_key o location para confirmar');
    }

    options.onProgress?.({ fileName, phase: 'confirm' });

    await this.retry(async () => {
      const confirmResponse = await firstValueFrom(
        this.users.confirmPqrsAttachment(owner, {
          request_id: requestId,
          s3_key: presignResponse.s3_key,
          location: presignResponse.location,
          tamanio_bytes: file.file!.size,
        })
      );
      if (confirmResponse.code !== 200) {
        throw new Error(confirmResponse.message || 'No se pudo confirmar el adjunto');
      }
    }, confirmRetries, retryDelayMs);
  }

  /**
   * Respaldo SDK: sube vía Lambda usando la misma s3_key/location del presign
   * (o la nomenclatura url_signer si no hubo presign previo).
   */
  async uploadPqrsFileViaSdk(
    file: ApplicantAttachments,
    requestId: number,
    owner: PqrsAttachmentOwner,
    presign?: Pick<PqrsPresignMetadata, 's3_key' | 'location'>
  ): Promise<void> {
    if (!file.base64file) {
      throw new Error('No hay base64 disponible para el respaldo SDK.');
    }

    const payload: Record<string, unknown> = {
      file: file.base64file,
      filename: file.source_name,
      source_name: file.source_name,
      request_id: requestId,
      fileweight: file.fileweight ?? String(file.file?.size ?? 0),
      attachment_owner: owner,
      content_type: file.file?.type || 'application/octet-stream',
      tamanio_bytes: file.file?.size,
    };

    if (presign?.s3_key) {
      payload['s3_key'] = presign.s3_key;
    }
    if (presign?.location) {
      payload['location'] = presign.location;
    }

    const response = await firstValueFrom(this.users.uploadPostSdk(payload));
    if (!this.isSdkUploadResponseOk(response)) {
      const body = response as unknown as Record<string, unknown>;
      const code = body['code'] ?? body['statusCode'];
      throw new Error(
        `La subida alternativa a S3 falló para ${file.source_name} (código ${code}).`
      );
    }
  }

  /** Sube un lote PQRS secuencialmente y devuelve éxitos/fallos. */
  async uploadPqrsBatch(
    files: ApplicantAttachments[],
    requestId: number,
    owner: PqrsAttachmentOwner,
    options: PqrsUploadOptions = {}
  ): Promise<BatchUploadResult> {
    const result: BatchUploadResult = { succeeded: [], failed: [] };

    for (const file of files) {
      const fileName = file.source_name ?? file.file?.name ?? 'archivo';
      try {
        await this.uploadPqrsFile(file, requestId, owner, options);
        result.succeeded.push(fileName);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido en la subida';
        result.failed.push({ fileName, error: message });
      }
    }

    return result;
  }

  /** Flujo afiliación: generar-url → PUT S3 → confirmar (idempotente). */
  async uploadAfiliationAdditional(
    file: File,
    options: AfiliationAdditionalUploadOptions
  ): Promise<Adjunto> {
    const contentType = (file.type ?? '').trim() || 'application/octet-stream';
    const fileName = file.name;
    const presignRetries = options.presignRetries ?? AttachmentUploadService.DEFAULT_RETRIES;
    const uploadRetries = options.uploadRetries ?? AttachmentUploadService.DEFAULT_RETRIES;
    const confirmRetries = options.confirmRetries ?? AttachmentUploadService.DEFAULT_RETRIES;
    const retryDelayMs = options.retryDelayMs ?? AttachmentUploadService.DEFAULT_DELAY_MS;

    options.onProgress?.({ fileName, phase: 'presign' });

    const presignData = await this.retry(async () => {
      const res = await firstValueFrom(
        this.users.obtenerUrlPresignadaS3({
          id_persona: options.idPersona,
          nombre_archivo: fileName,
          content_type: contentType,
        })
      );
      if (res?.code !== 200 || !res.data) {
        throw new Error(res?.message || 'No se pudo obtener la URL de carga');
      }
      return this.parseAfiliationPresign(res.data);
    }, presignRetries, retryDelayMs);

    options.onProgress?.({ fileName, phase: 'upload', percent: 0 });

    await this.retry(
      () =>
        this.putFileToS3(presignData.urlPresignada, file, contentType, percent =>
          options.onProgress?.({ fileName, phase: 'upload', percent })
        ),
      uploadRetries,
      retryDelayMs
    );

    options.onProgress?.({ fileName, phase: 'confirm' });

    const adjunto = await this.retry(async () => {
      const payloadConfirmacion: Record<string, unknown> = {
        id_persona: options.idPersona,
        nombre_archivo: fileName,
        content_type: contentType,
        tamanio_bytes: file.size,
        s3_key: presignData.s3Key,
      };
      if (options.idTipoAdjunto != null && options.idTipoAdjunto !== '') {
        payloadConfirmacion['id_tipo_adjunto'] = options.idTipoAdjunto;
      }

      const res = await firstValueFrom(this.users.confirmarAdjuntoS3(payloadConfirmacion));
      if (res?.code !== 200 || !res.data) {
        throw new Error(res?.message || 'No se pudo confirmar el adjunto');
      }
      const adjuntoGuardado = res.data as Adjunto;
      if (!adjuntoGuardado?.id) {
        throw new Error('La confirmación no devolvió un adjunto válido');
      }
      return adjuntoGuardado;
    }, confirmRetries, retryDelayMs);

    return adjunto;
  }

  /** Documentos de actualización de empresa. */
  async uploadCompanyDocument(
    file: ApplicantAttachments,
    requestId: number,
    documentType: string,
    options: PqrsUploadOptions = {}
  ): Promise<void> {
    if (!file?.file) {
      throw new Error('El archivo no es válido.');
    }

    const fileName = file.source_name ?? file.file.name;
    const contentType = file.file.type || 'application/octet-stream';
    const retryDelayMs = options.retryDelayMs ?? AttachmentUploadService.DEFAULT_DELAY_MS;

    options.onProgress?.({ fileName, phase: 'presign' });

    const presign = await this.retry(async () => {
      const response = await firstValueFrom(
        this.users.getUrlSignedCompany(this.buildPqrsPresignPayload(file, requestId), documentType)
      );
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || 'No se pudo obtener la URL prefirmada');
      }
      return parsePresignUploadData(response.data);
    }, options.presignRetries ?? AttachmentUploadService.DEFAULT_RETRIES, retryDelayMs);

    file.preSignedUrl = presign.presigned_url;

    options.onProgress?.({ fileName, phase: 'upload', percent: 0 });

    await this.retry(
      () =>
        this.putFileToS3(presign.presigned_url, file.file!, contentType, percent =>
          options.onProgress?.({ fileName, phase: 'upload', percent })
        ),
      options.uploadRetries ?? AttachmentUploadService.DEFAULT_RETRIES,
      retryDelayMs
    );

    options.onProgress?.({ fileName, phase: 'confirm' });

    await this.retry(async () => {
      const confirmResponse = await firstValueFrom(
        this.users.confirmCompanyAttachment(documentType, {
          request_id: requestId,
          s3_key: presign.s3_key,
          location: presign.location,
          tamanio_bytes: file.file!.size,
        })
      );
      if (confirmResponse.code !== 200) {
        throw new Error(confirmResponse.message || 'No se pudo confirmar el documento');
      }
    }, options.confirmRetries ?? AttachmentUploadService.DEFAULT_RETRIES, retryDelayMs);
  }

  /** Documentos de solicitud de medio de pago. */
  async uploadPaymentMethodDocument(
    file: ApplicantAttachments,
    requestId: number,
    options: PqrsUploadOptions = {}
  ): Promise<void> {
    if (!file?.file) {
      throw new Error('El archivo no es válido.');
    }

    const fileName = file.source_name ?? file.file.name;
    const contentType = file.file.type || 'application/octet-stream';
    const retryDelayMs = options.retryDelayMs ?? AttachmentUploadService.DEFAULT_DELAY_MS;

    options.onProgress?.({ fileName, phase: 'presign' });

    const presign = await this.retry(async () => {
      const response = await firstValueFrom(
        this.users.getUrlSignedPaymentMethodRequest(
          this.buildPqrsPresignPayload(file, requestId),
          'payment_method'
        )
      );
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || 'No se pudo obtener la URL prefirmada');
      }
      return parsePresignUploadData(response.data);
    }, options.presignRetries ?? AttachmentUploadService.DEFAULT_RETRIES, retryDelayMs);

    file.preSignedUrl = presign.presigned_url;

    options.onProgress?.({ fileName, phase: 'upload', percent: 0 });

    await this.retry(
      () =>
        this.putFileToS3(presign.presigned_url, file.file!, contentType, percent =>
          options.onProgress?.({ fileName, phase: 'upload', percent })
        ),
      options.uploadRetries ?? AttachmentUploadService.DEFAULT_RETRIES,
      retryDelayMs
    );

    options.onProgress?.({ fileName, phase: 'confirm' });

    await this.retry(async () => {
      const confirmResponse = await firstValueFrom(
        this.users.confirmPaymentMethodAttachment('payment_method', {
          request_id: requestId,
          s3_key: presign.s3_key,
          location: presign.location,
          tamanio_bytes: file.file!.size,
        })
      );
      if (confirmResponse.code !== 200) {
        throw new Error(confirmResponse.message || 'No se pudo confirmar el documento');
      }
    }, options.confirmRetries ?? AttachmentUploadService.DEFAULT_RETRIES, retryDelayMs);
  }

  /** Registra fallo de subida en el log de adjuntos PQRS. */
  logUploadError(file: ApplicantAttachments, requestId: number, error: HttpErrorResponse): void {
    const payload: ErrorAttachLog = {
      request_id: requestId,
      status: 'REPORTADO',
      name_archive: file.source_name,
      error_message: `Status: ${error.status}, StatusText: ${error.statusText}, Message: ${error.message}, URL: ${error.url || 'unknown'}`,
      error_type: 'S3',
    };
    this.users.registerErrorAttach(payload).subscribe();
  }

  private parseAfiliationPresign(data: PresignAdjuntoAdicionalData): {
    urlPresignada: string;
    s3Key: string;
  } {
    const parsed = parsePresignUploadData(data);
    const urlPresignada = parsed.presigned_url;
    const s3Key = parsed.s3_key.trim();
    if (!urlPresignada.trim() || !s3Key) {
      throw new Error('La respuesta no incluye url_presignada o s3_key');
    }
    return { urlPresignada, s3Key };
  }

  private toPresignMetadata(
    presign: ReturnType<typeof parsePresignUploadData>
  ): PqrsPresignMetadata | undefined {
    if (!presign.presigned_url || !presign.s3_key || !presign.location) {
      return undefined;
    }
    return {
      presigned_url: presign.presigned_url,
      s3_key: presign.s3_key,
      location: presign.location,
    };
  }

  private isSdkUploadResponseOk(response: unknown): boolean {
    if (!response || typeof response !== 'object') {
      return true;
    }
    const body = response as Record<string, unknown>;
    const code = body['code'] ?? body['statusCode'];
    if (code == null) {
      return true;
    }
    return Number(code) === 200;
  }
}
