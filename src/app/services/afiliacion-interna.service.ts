import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { EndPointRoute } from '../enums/routes.enum';
import { BodyResponse } from '../models/shared/body-response.inteface';
import { ValidarEmpresaResponse } from '../models/afiliacion-interna/validar-empresa.interface';
import {
  GuardarSolicitudRequestInterna,
  GuardarSolicitudResponseInterna,
} from '../models/afiliacion-interna/guardar-solicitud.interface';
import {
  ValidarBeneficiarioRequestBody,
  ValidarBeneficiarioResponse,
} from '../models/afiliacion-interna/validar-beneficiario.interface';
import { ValidarTrabajadorResponse } from '../models/afiliacion-interna/validar-trabajador.interface';
import {
  ConsultarTrabajadorActivoInternaRequest,
  TrabajadorActivoInternaResponse,
} from '../models/afiliacion-interna/trabajador-activo.interface';
import {
  AgregarBeneficiarioTrabajadorActivoRequestInterna,
  AgregarBeneficiarioTrabajadorActivoResponseInterna,
} from '../models/afiliacion-interna/agregar-beneficiario-trabajador-activo.interface';
import { WsTokenAfiliacionInternaResponse } from '../models/afiliacion-interna/ws-token.interface';
import { environment } from '../../environments/environment';

/** Cuerpo enviado a la Lambda orquestadora (validar empresa antes de identificar trabajador). */
export interface ValidarEmpresaRequestBody {
  tipo_documento: string;
  numero_documento: string;
}

/** Cuerpo enviado a validar-trabajador (JSON plano esperado por el backend). */
export interface ValidarTrabajadorRequestBody {
  tipoDocumento: string;
  numeroDocumento: string;
  idEmpresa: number;
}

@Injectable({
  providedIn: 'root',
})
export class AfiliacionInternaService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Valida la empresa vía Lambda orquestadora (resolución de id y estado en WS afiliación empresa).
   * Espera el mismo sobre `BodyResponse` que el resto del portal (`code`, `message`, `data`).
   * Si la Lambda devuelve otro formato, adapte aquí o en el API Gateway.
   */
  validarEmpresa(tipoDoc: string, numDoc: string): Observable<BodyResponse<ValidarEmpresaResponse>> {
    const body: ValidarEmpresaRequestBody = {
      tipo_documento: tipoDoc,
      numero_documento: numDoc,
    };
    return this.http.post<BodyResponse<ValidarEmpresaResponse>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFILIACION_INTERNA_VALIDAR_EMPRESA}`,
      body
    );
  }

  /**
   * Valida trabajador y obtiene datos prellenados para la solicitud.
   * El `Authorization` lo añade el interceptor HTTP global.
   */
  validarTrabajador(body: ValidarTrabajadorRequestBody): Observable<BodyResponse<ValidarTrabajadorResponse>> {
    return this.http.post<BodyResponse<ValidarTrabajadorResponse>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFILIACION_INTERNA_VALIDAR_TRABAJADOR}`,
      body
    );
  }

  /**
   * Consulta si el trabajador está activo para la empresa (flujo afiliación beneficiario interna).
   * Proxy Lambda → GET trabajador-activo del WS.
   */
  consultarTrabajadorActivo(
    body: ConsultarTrabajadorActivoInternaRequest
  ): Observable<BodyResponse<TrabajadorActivoInternaResponse>> {
    return this.http.post<BodyResponse<TrabajadorActivoInternaResponse>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFILIACION_INTERNA_CONSULTAR_TRABAJADOR_ACTIVO}`,
      body
    );
  }

  /** Valida beneficiario (persona a cargo) antes de agregarlo al listado. */
  validarBeneficiario(
    body: ValidarBeneficiarioRequestBody
  ): Observable<BodyResponse<ValidarBeneficiarioResponse>> {
    return this.http.post<BodyResponse<ValidarBeneficiarioResponse>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFILIACION_INTERNA_VALIDAR_BENEFICIARIO}`,
      body
    );
  }

  /**
   * Obtiene JWT scoped del WS (payload liviano vía Lambda).
   * El front usa este token para POST directo a Tomcat y evitar 413 en API Gateway.
   */
  obtenerWsToken(idEmpresa: number): Observable<BodyResponse<WsTokenAfiliacionInternaResponse>> {
    return this.http.post<BodyResponse<WsTokenAfiliacionInternaResponse>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFILIACION_INTERNA_WS_TOKEN}`,
      { idEmpresa }
    );
  }

  /**
   * Guarda solicitud de afiliación interna directo al WS (JSON, sin adjuntos o payload pequeño).
   */
  guardarSolicitudEnWs(
    idEmpresa: number,
    body: GuardarSolicitudRequestInterna
  ): Observable<GuardarSolicitudResponseInterna> {
    return this.postDirectoWs(idEmpresa, 'guardar-solicitud', body, false);
  }

  /**
   * Guarda solicitud con adjuntos en multipart directo al WS (hasta 50 MB en Tomcat).
   * FormData: part "solicitud" (JSON) + parts "adjuntos" (archivos en orden).
   */
  guardarSolicitudMultipartEnWs(
    idEmpresa: number,
    formData: FormData
  ): Observable<GuardarSolicitudResponseInterna> {
    return this.postDirectoWs(idEmpresa, 'guardar-solicitud', formData, true);
  }

  /**
   * Agrega beneficiarios a trabajador activo directo al WS (JSON; evita límite 6 MB de API Gateway).
   */
  agregarBeneficiarioTrabajadorActivoEnWs(
    body: AgregarBeneficiarioTrabajadorActivoRequestInterna
  ): Observable<AgregarBeneficiarioTrabajadorActivoResponseInterna> {
    return this.postDirectoWs(
      body.idEmpresa,
      'agregar-beneficiario-trabajador-activo',
      body,
      false
    );
  }

  /** @deprecated Radicación vía Lambda; usar guardarSolicitudEnWs / guardarSolicitudMultipartEnWs. */
  guardarSolicitud(
    body: GuardarSolicitudRequestInterna
  ): Observable<BodyResponse<GuardarSolicitudResponseInterna>> {
    return this.http.post<BodyResponse<GuardarSolicitudResponseInterna>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFILIACION_INTERNA_GUARDAR_SOLICITUD}`,
      body
    );
  }

  /** @deprecated Radicación vía Lambda; usar agregarBeneficiarioTrabajadorActivoEnWs. */
  agregarBeneficiarioTrabajadorActivo(
    body: AgregarBeneficiarioTrabajadorActivoRequestInterna
  ): Observable<BodyResponse<AgregarBeneficiarioTrabajadorActivoResponseInterna>> {
    return this.http.post<BodyResponse<AgregarBeneficiarioTrabajadorActivoResponseInterna>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFILIACION_INTERNA_AGREGAR_BENEFICIARIO}`,
      body
    );
  }

  private postDirectoWs<T>(
    idEmpresa: number,
    pathSuffix: string,
    body: unknown,
    multipart: boolean
  ): Observable<T> {
    return this.obtenerWsToken(idEmpresa).pipe(
      switchMap(res => {
        if (res.code !== 200 || !res.data?.token || !res.data?.wsBaseUrl) {
          return throwError(() => ({
            message: res.message ?? 'No se pudo obtener token del servicio de afiliación.',
          }));
        }
        const base = res.data.wsBaseUrl.replace(/\/$/, '');
        const url = `${base}/afiliacion/${pathSuffix}`;
        let headers = new HttpHeaders({
          Authorization: `Bearer ${res.data.token}`,
          'X-Id-Empresa': String(idEmpresa),
        });
        if (!multipart) {
          headers = headers.set('Content-Type', 'application/json');
        }
        return this.http.post<T>(url, body, { headers });
      }),
      catchError((error: HttpErrorResponse | { message?: string }) => {
        if (error instanceof HttpErrorResponse) {
          const errBody = error.error;
          const mensaje =
            (typeof errBody === 'object' && errBody !== null
              ? errBody['message'] ?? errBody['mensaje'] ?? errBody['error']
              : null) ??
            (error.status === 0
              ? 'No se pudo conectar con el servicio de afiliación.'
              : `Error ${error.status}: ${error.statusText}`);
          return throwError(() => ({ message: String(mensaje) }));
        }
        return throwError(() => error);
      })
    );
  }
}
