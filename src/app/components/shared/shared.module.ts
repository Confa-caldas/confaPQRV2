import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDinamicModule } from './modal-dinamic/modal-dinamic.module';
import { ModalInputModule } from './modal-input/modal-input.module';
import { ModalSelectorModule } from './modal-selector/modal-selector.module';
import { ModalModalityModule } from './modal-modality/modal-modality.module';
import { ModalAssignSelectorModule } from './modal-assign-selector/modal-assign-selector.module';
import { ModalCategoryModule } from './modal-category/modal-category.module';
import { ModalAlertModule } from './modal-alert/modal-alert.module';
import { ModalDataTreatmentModule } from './modal-data-treatment/modal-data-treatment.module';
import { ModalNotificationModule } from './modal-notification/modal-notification.module';
import { ModalCharacterizationModule } from './modal-characterization/modal-characterization.module';
import { ModalFilingModule } from './modal-filing/modal-filing.module';
import { ModalManagerSelectorModule } from './modal-manager-selector/modal-manager-selector.module';
import { ModalReviewStateModule } from './modal-review-state/modal-review.state.module';
import { MainNotificationModule } from './main-notification/main-notification.module';
import { ModalInputDocumentModule } from './modal-input-document/modal-input-document.module';
import { ModalReasonAccountUpdateModule } from './modal-reason-account-update/modal-reason-account-update.module';
import { ModalAccountTypeModule } from './modal-account-type/modal-account-type.module';
import { ModalEntityModule } from './modal-entity/modal-entity.module';
import { ModalEntityAccountTypeModule } from './modal-entity-account-type/modal-entity-account-type.module';
import { ModalAssignUserModule } from './modal-assign-user/modal-assign-user.module';
import { ModalSuccessfulTransferModule } from './modal-successful-transfer/modal-successful-transfer.module';

@NgModule({
  declarations: [
  
  
    
  ],
  imports: [
    CommonModule,
    ModalDinamicModule,
    ModalInputModule,
    ModalSelectorModule,
    ModalModalityModule,
    ModalCategoryModule,
    ModalAlertModule,
    ModalDataTreatmentModule,
    ModalNotificationModule,
    ModalCharacterizationModule,
    ModalFilingModule,
    ModalManagerSelectorModule,
    ModalReviewStateModule,
    MainNotificationModule,
    ModalReasonAccountUpdateModule,
    ModalAccountTypeModule,
    ModalEntityModule,
    ModalEntityAccountTypeModule,
    ModalAssignUserModule,
    ModalSuccessfulTransferModule,
  ],
  exports: [
    ModalDinamicModule,
    ModalInputModule,
    ModalSelectorModule,
    ModalModalityModule,
    ModalAssignSelectorModule,
    ModalCategoryModule,
    ModalAlertModule,
    ModalDataTreatmentModule,
    ModalNotificationModule,
    ModalCharacterizationModule,
    ModalFilingModule,
    ModalManagerSelectorModule,
    ModalReviewStateModule,
    MainNotificationModule,
    ModalReasonAccountUpdateModule,
    ModalAccountTypeModule,
    ModalEntityModule,
    ModalEntityAccountTypeModule,
    ModalAssignUserModule,
    ModalSuccessfulTransferModule,
  ],
})
export class SharedModule {}
