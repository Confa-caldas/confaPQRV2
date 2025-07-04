import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './components/public/login/login.module';
import { LayoutModule } from './components/private/layout/layout.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpRequestInterceptor } from './services/interceptors/http-request.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LayoutRequestModule } from './components/private/layout-request/layout-request.module';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CreateRequestInternalComponent } from './components/private/create-request-internal/create-request-internal.component';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    AppRoutingModule,
    LoginModule,
    LayoutModule,
    LayoutRequestModule,
    ToastModule,
    RouterModule,
    TooltipModule,
  ],
  providers: [
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
