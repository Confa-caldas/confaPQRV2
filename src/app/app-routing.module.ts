import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/public/login/login.component';
import { LayoutComponent } from './components/private/layout/layout.component';
import { RoutesApp } from './enums/routes.enum';
import { sessionGuard } from './guards/session.guard';
import { LayoutRequestComponent } from './components/private/layout-request/layout-request.component';

const routes: Routes = [
  { path: RoutesApp.LOGIN, component: LoginComponent },
  {
    path: RoutesApp.REQUEST_MANAGER,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/request-manager/request-manager.module').then(
        m => m.RequestManagerModule
      ),
  },
  {
    path: RoutesApp.APPLICANT_TYPE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/applicant-type/applicant-type.module').then(
        m => m.ApplicantTypeModule
      ),
  },
  {
    path: RoutesApp.REQUEST_TYPE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/request-type/request-type.module').then(
        m => m.RequestTypeModule
      ),
  },
  {
    path: RoutesApp.APPLICANT_REQUEST,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/applicant-request/applicant-request.module').then(
        m => m.ApplicantRequestModule
      ),
  },
  {
    path: RoutesApp.MODALITY,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/modality/modality.module').then(m => m.ModalityModule),
  },
  {
    path: RoutesApp.CATEGORY,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/category/category.module').then(m => m.CategoryModule),
  },
  {
    path: RoutesApp.SEARCH_REQUEST,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/search-request/search-request.module').then(
        m => m.SearchRequestModule
      ),
  },
  {
    path: RoutesApp.SEARCH_REQUEST_INTERNAL,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/search-request-internal/search-request-internal.module').then(
        m => m.SearchRequestInternalModule
      ),
  },
  {
    path: RoutesApp.SEARCH_UPDATE_COMPANY,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/search-update-company/search-update-company.module').then(
        m => m.SearchUpdateCompanyModule
      ),
  },
  {
    path: RoutesApp.REQUEST_REPORT,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/requests-report/requests-report.module').then(
        m => m.RequestsReportModule
      ),
  },
  {
    path: RoutesApp.REQUEST_DETAILS + '/:id',
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/request-details/request-details.module').then(
        m => m.RequestDetailsModule
      ),
  },
  {
    path: RoutesApp.NOTIFICATIONS,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/notifications/notifications.module').then(
        m => m.NotificationsModule
      ),
  },
  {
    path: RoutesApp.PROCESS_REQUEST,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/process-request/process-request.module').then(
        m => m.ProcessRequestModule
      ),
  },
  {
    path: RoutesApp.CREATE_REQUEST,
    //canActivate: [sessionGuard],
    component: LayoutRequestComponent,
    loadChildren: () =>
      import('./components/private/create-request/create-request.module').then(
        m => m.CreateRequestModule
      ),
  },
  {
    path: RoutesApp.REQUEST_FORM,
    //canActivate: [sessionGuard],
    component: LayoutRequestComponent,
    loadChildren: () =>
      import('./components/private/request-form/request-form.module').then(
        m => m.RequestFormModule
      ),
  },
  {
    path: RoutesApp.CREATE_REQUEST_INTERNAL,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/create-request-internal/create-request-internal.module').then(
        m => m.CreateRequestInternalModule
      ),
  },
  {
    path: RoutesApp.REQUEST_FORM_INTERNAL,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/request-form-internal/request-form-internal.module').then(
        m => m.RequestFormInternalModule
      ),
  },
  {
    path: RoutesApp.FORM_COMPANY,
    component: LayoutRequestComponent,
    loadChildren: () =>
      import('./components/private/form-company/form-company.module').then(
        m => m.FormCompanygModule
      ),
  },
  {
    path: RoutesApp.REPORT_DETAILS,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/report-details/report-details.module').then(
        m => m.ReportDetailsModule
      ),
  },
  {
    path: RoutesApp.REQUESTTYPE_MANAGER_ASSOCIATE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import(
        './components/private/requestype-manager-associate/requestype-manager-associate.module'
      ).then(m => m.RequestypeManagerAssociateModule),
  },
  {
    path: RoutesApp.REQUEST_PENDING,
    //canActivate: [sessionGuard],
    component: LayoutRequestComponent,
    loadChildren: () =>
      import('./components/private/request-pending/request-pending.module').then(
        m => m.RequestPendingModule
      ),
  },
  {
    path: RoutesApp.INTERN_SEARCH_REQUEST,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/intern-search-request/intern-search-request.module').then(
        m => m.InternSearchRequestModule
      ),
  },
  {
    path: RoutesApp.MAIN_PAGE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/shared/main-page/main-page.module').then(m => m.MainPageModule),
  },
  { path: '', redirectTo: '/' + RoutesApp.CREATE_REQUEST, pathMatch: 'full' },
  // Puedes agregar una ruta comodín para manejar rutas no encontradas (opcional)
  { path: '**', redirectTo: '' + RoutesApp.CREATE_REQUEST, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
