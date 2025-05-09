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
    this.blockUI(true);
    this.spinner.show();

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
      this.blockUI(false);
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
    if (token && !requestOut.url.includes('.s3.amazonaws.com')) {
      requestOut = requestOut.clone({
        headers: requestOut.headers.set('Authorization', `${token}`),
      });
    }

    return next.handle(requestOut).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Acceso no autorizado',
            detail: 'Tu sesión ha expirado o no tienes permisos.',
          });
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
          this.blockUI(false)}, 500);
      })
    );
  }

  private blockUI(show: boolean) {
    if (show) {
      this.activeRequests++;
      document.body.classList.add('blocked');
    } else {
      this.activeRequests--;
      if (this.activeRequests <= 0) {
        document.body.classList.remove('blocked');
        this.activeRequests = 0;
      }
    }
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