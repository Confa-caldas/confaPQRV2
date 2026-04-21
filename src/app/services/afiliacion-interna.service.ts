import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EndPointRoute } from '../enums/routes.enum';
import { BodyResponse } from '../models/shared/body-response.inteface';
import { ValidarEmpresaResponse } from '../models/afiliacion-interna/validar-empresa.interface';
import { ValidarTrabajadorResponse } from '../models/afiliacion-interna/validar-trabajador.interface';
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
}
