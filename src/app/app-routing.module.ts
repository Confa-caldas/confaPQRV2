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
    path: RoutesApp.SEARCH_REQUEST_EXTERNAL,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/search-request-external/search-request-external.module').then(
        m => m.SearchRequestExternalModule
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
    path: RoutesApp.REQUEST_REPORT_EXTERNAL,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/requests-report-external/requests-report-external.module').then(
        m => m.RequestsReportExternalModule
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
    path: RoutesApp.PROCESS_REQUEST_AFILIATION,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/process-request-afiliation/process-request-afiliation.module').then(
        m => m.ProcessRequestAfiliationModule
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
    path: RoutesApp.SEARCH_REQUEST_AFILIATIONS,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/search-request-afiliations/search-request-afiliations.module').then(
        m => m.SearchRequestAfiliationsModule
      ),
  },
  {
    path: RoutesApp.SEARCH_REQUEST_AFI_MASSIVE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/search-request-afi-massive/search-request-afi-massive.module').then(
        m => m.SearchRequestAfiMassiveModule
      ),
  },
  {
    path: RoutesApp.SEARCH_REQUEST_AFI_PENDING,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/search-request-afi-pending/search-request-afi-pending.module').then(
        m => m.SearchRequestAfiPendingModule
      ),
  },
  {
    path: RoutesApp.SEARCH_UPDATES_DATA,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/search-updates-data/search-updates-data.module').then(
        m => m.SearchUpdatesDataModule
      ),
  },
  {
    path: RoutesApp.REQUEST_DETAILS_AFILIATION + '/:id',
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/request-details-afiliation/request-details-afiliation.module').then(
        m => m.RequestDetailsAfiliationModule
      ),
  },
  {
    path: RoutesApp.UPDATES_DATA_DETAILS + '/:id',
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/updates-data-details/updates-data-details.module').then(
        m => m.UpdatesDataDetailsModule
      ),
  },
  {
    path: RoutesApp.REPORT_DETAILS_AFILIATIONS,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/report-details-afiliations/report-details-afiliations.module').then(
        m => m.ReportDetailsAfiliationsModule
      ),
  },
  {
    path: RoutesApp.GENDER,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/gender/gender.module').then(m => m.GenderModule),
  },
  {
    path: RoutesApp.MARITAL_STATUS,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/marital-status/marital-status.module').then(m => m.MaritalStatusModule),
  },
  {
    path: RoutesApp.SYSTEM_VARIABLES,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/system-variables/system-variables.module').then(m => m.SystemVariablesModule),
  },
  {
    path: RoutesApp.AFI_TEMPLATE_VALIDATIONS,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/afiliation-template-validations/afiliation-template-validations.module').then(m => m.AfiliationTemplateValidationsModule),
  },
  {
    path: RoutesApp.AFI_COMPANY_VALIDATIONS,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/afiliation-company/afiliaton-company.module').then(m => m.AfiliationCompanyModule),
  },
  {
    path: RoutesApp.DOCUMENT_TYPE_COMPANY,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/document-type/document-type.module').then(m => m.DocumentTypeModule),
  },
  {
    path: RoutesApp.DOCUMENT_TYPE_PERSON,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/document-type-person/document-type-person.module').then(m => m.DocumentTypePersonModule),
  },
  {
    path: RoutesApp.DEPARTMENT,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/department/department.module').then(m => m.DepartmentModule),
  },
  {
    path: RoutesApp.MUNICIPALITY,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/municipality/municipality.module').then(m => m.MunicipalityModule),
  },
  {
    path: RoutesApp.ATTACHMENT_TYPE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/attachment-type/attachment-type.module').then(m => m.AttachmentTypeModule),
  },
  {
    path: RoutesApp.RELATIONSHIP,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/relationship/relationship.module').then(m => m.RelationshipModule),
  },
  {
    path: RoutesApp.RESPONSIBLE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/responsible/responsible.module').then(m => m.ResponsibleModule),
  },
  {
    path: RoutesApp.AFI_NOTIFICATIONS,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/afiliation-notifications/afiliation-notifications.module').then(m => m.AfiliationNotificationsModule),
  },
  {
    path: RoutesApp.AFI_CERTIFICATE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/afiliation-certificate/afiliation-certificate.module').then(m => m.AfiliationCertificateModule),
  },
  {
    path: RoutesApp.BANK,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/bank/bank.module').then(m => m.BankModule),
  },
  {
    path: RoutesApp.ACCOUNT_TYPE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/account-type/account-type.module').then(m => m.AccountTypeModule),
  },
  {
    path: RoutesApp.BANK_ACCOUNT_ASSOCIATE,
    canActivate: [sessionGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./components/private/bank-account-association/bank-account-association.module').then(m => m.BankAccountAssociationModule),
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
