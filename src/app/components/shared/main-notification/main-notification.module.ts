import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNotificationComponent } from './main-notification.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MainNotificationComponent],
  exports: [MainNotificationComponent],
  imports: [CommonModule, ScrollPanelModule, RouterModule]
})
export class MainNotificationModule { }