import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestDetailsAfiliationRoutingModule } from './request-details-afiliation-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { RequestDetailsAfiliationComponent } from './request-details-afiliation.component';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { TimelineModule } from 'primeng/timeline';
import { AccordionModule } from 'primeng/accordion';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
 
@NgModule({
  declarations: [RequestDetailsAfiliationComponent],
  imports: [
    CommonModule,
    RequestDetailsAfiliationRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    CardModule,
    TabViewModule,
    DatePipe,
    ToastModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDocViewerModule,
    DialogModule,
    MenuModule,
    TimelineModule,
    AccordionModule,
    MessageModule,
    TooltipModule,
  ],
  exports: [RequestDetailsAfiliationComponent],
})
export class RequestDetailsAfiliationModule {}
