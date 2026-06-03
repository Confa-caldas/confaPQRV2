import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficePreviewComponent } from './office-preview.component';

@NgModule({
  declarations: [OfficePreviewComponent],
  imports: [CommonModule],
  exports: [OfficePreviewComponent],
})
export class OfficePreviewModule {}
