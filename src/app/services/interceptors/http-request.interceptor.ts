import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError, catchError, finalize } from 'rxjs';
import { retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

import { SessionStorageItems } from '../../enums/session-storage-items.enum';
import { RoutesApp } from '../../enums/routes.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { isS3PresignedRequest } from '../../utils/s3-url.util';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private spinner: NgxSpinnerService
  ) {}

  intercept(requestIn: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isS3Upload = isS3PresignedRequest(requestIn.url);

    if (!isS3Upload) {
      this.beginRequest();
    }

    const sessionToken = sessionStorage.getItem(SessionStorageItems.SESSION);
    const token = sessionToken || '';

    const isTokenExpired = (tokenValue: string): boolean => {
      try {
        const { exp } = jwtDecode<JwtPayload>(tokenValue);
        const now = Math.floor(Date.now() / 1000);
        return exp < now;
      } catch (e) {
        return true;
      }
    };

    if (token && isTokenExpired(token)) {
      if (!isS3Upload) {
        this.endRequest();
      }
      this.messageService.add({
        severity: 'warn',
        summary: 'Sesión expirada',
        detail: 'Tu sesión ha expirado, por favor inicia sesión de nuevo.',
      });
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigate([RoutesApp.LOGOUT]);
      return throwError(() => new Error('Sesión expirada'));
    }

    let requestOut = requestIn;
    // Comparación en minúsculas porque las llamadas directas al WS usan el dominio real
    // "afiliacionEmpresaWS" (sin guiones, con mayúsculas), que no calzaba con el patrón
    // 'afiliacion-empresa-ws'; se agrega también 'afiliacion-interna' para las rutas de la
    // Lambda orquestadora (validar-empresa, validar-trabajador, ws-token, etc.), que antes
    // no calzaban con ningún patrón y por eso su error real quedaba oculto tras "The Error".
    const urlEnMinusculas = requestOut.url.toLowerCase();
    const esWsAfiliacionEmpresa =
      urlEnMinusculas.includes('afiliacion-empresa-ws') ||
      urlEnMinusculas.includes('p.confa.co/afiliacion') ||
      urlEnMinusculas.includes('afiliacionempresaws') ||
      urlEnMinusculas.includes('afiliacion-interna');

    if (token && !isS3Upload) {
      if (!requestOut.headers.has('Authorization')) {
        requestOut = requestOut.clone({
          headers: requestOut.headers.set('Authorization', `${token}`),
        });
      }
    }

    if (isS3Upload) {
      return next.handle(requestOut).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
    }

    return next.handle(requestOut).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !esWsAfiliacionEmpresa) {
          this.messageService.add({
            severity: 'error',
            summary: 'Acceso no autorizado',
            detail: 'Tu sesión ha expirado o no tienes permisos.',
          });
          sessionStorage.clear();
          localStorage.clear();
          this.router.navigate([RoutesApp.LOGOUT]);
        }
        if (esWsAfiliacionEmpresa) {
          return throwError(() => error);
        }
        return throwError(() => new Error('The Error'));
      }),
      finalize(() => this.endRequest())
    );
  }

  /** Mantiene spinner/bloqueo mientras haya al menos una petición HTTP en curso. */
  private beginRequest(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      document.body.classList.add('blocked');
      this.spinner.show();
    }
  }

  private endRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests > 0) {
      return;
    }
    setTimeout(() => {
      if (this.activeRequests === 0) {
        this.spinner.hide();
        document.body.classList.remove('blocked');
      }
    }, 500);
  }
}
