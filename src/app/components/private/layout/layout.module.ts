import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { TreeModule } from 'primeng/tree';
import { LayoutRoutingModule } from './layout-routing.module';
import { MenuModule } from 'primeng/menu';
import { MainNotificationModule } from '../../shared/main-notification/main-notification.module';
@NgModule({
  declarations: [LayoutComponent],
  imports: [CommonModule, LayoutRoutingModule, TreeModule, MenuModule, MainNotificationModule],
  exports: []
})
export class LayoutModule {}
