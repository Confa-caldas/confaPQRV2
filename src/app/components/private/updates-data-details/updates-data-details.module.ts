import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UpdatesDataDetailsRoutingModule } from './updates-data-details-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { UpdatesDataDetailsComponent } from './updates-data-details.component';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { TimelineModule } from 'primeng/timeline';
import { AccordionModule } from 'primeng/accordion';
import { MessageModule } from 'primeng/message';
 
@NgModule({
  declarations: [UpdatesDataDetailsComponent],
  imports: [
    CommonModule,
    UpdatesDataDetailsRoutingModule,
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
    NgxDocViewerModule,
    DialogModule,
    MenuModule,
    TimelineModule,
    AccordionModule,
    MessageModule,
  ],
  exports: [UpdatesDataDetailsComponent],
})
export class UpdatesDataDetailsModule {}
