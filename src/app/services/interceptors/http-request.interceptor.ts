import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError, retry, catchError, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

import { SessionStorageItems } from '../../enums/session-storage-items.enum';
import { RoutesApp } from '../../enums/routes.enum';
import { NgxSpinnerService } from 'ngx-spinner';

import { MessageService } from 'primeng/api';

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
    this.beginRequest();

    const sessionToken = sessionStorage.getItem(SessionStorageItems.SESSION);
    const token = sessionToken || '';

    const isTokenExpired = (token: string): boolean => {
      try {
        const { exp } = jwtDecode<JwtPayload>(token);
        const now = Math.floor(Date.now() / 1000);
        return exp < now;
      } catch (e) {
        return true;
      }
    };

    if (token && isTokenExpired(token)) {
      this.endRequest();
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
    const esWsAfiliacionEmpresa =
      requestOut.url.includes('afiliacion-empresa-ws') || requestOut.url.includes('p.confa.co/afiliacion');
    if (token && !requestOut.url.includes('.s3.amazonaws.com')) {
      if (!requestOut.headers.has('Authorization')) {
        requestOut = requestOut.clone({
          headers: requestOut.headers.set('Authorization', `${token}`),
        });
      }
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


 /*import { Router } from '@angular/router';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, finalize, Observable, retry, throwError } from 'rxjs';

import { NgxSpinnerService } from 'ngx-spinner';
import { SessionStorageItems } from '../../enums/session-storage-items.enum';
import { RoutesApp } from '../../enums/routes.enum';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  intercept(requestIn: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinner.show();
    const sessionToken = sessionStorage.getItem(SessionStorageItems.SESSION);
    let token;
    if (sessionToken) {
      token = sessionToken;
    }
    let requestOut = requestIn;
    if (token && !requestOut.url.includes('.s3.amazonaws.com')) {
      requestOut = requestOut.clone({
        headers: requestOut.headers.set('Authorization', `${token}`),
      });
    }

    return next.handle(requestOut).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.spinner.hide();
          sessionStorage.clear();
          localStorage.clear();
          this.router.navigate([RoutesApp.LOGOUT]);
        }
        return throwError(() => new Error('The Error'));
      }),
      finalize(() => {
        setTimeout(() => {
          this.spinner.hide();
        }, 500);
      })
    );
  }
}
*/