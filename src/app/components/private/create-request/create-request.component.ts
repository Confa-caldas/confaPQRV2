import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Users } from '../../../services/users.service';
import { ApplicantTypeList, RequestTypeList } from '../../../models/users.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Router } from '@angular/router';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.component.html',
  styleUrl: './create-request.component.scss',
})
export class CreateRequestComponent {
  optionsRequest: FormGroup;
  applicantList!: ApplicantTypeList[];
  requestList!: RequestTypeList[];
  visibleDialogDataT = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: Users,
    private messageService: MessageService
  ) {
    this.optionsRequest = this.formBuilder.group({
      applicant_id: ['', Validators.required],
      request_id: ['', Validators.required],
      authorize: [null, Validators.requiredTrue],
      
    });

    localStorage.removeItem('visitedFirstPage');
    this.getApplicantList();
  }
  changeRequest() {
    this.optionsRequest.get('request_id')?.setValue('');
    this.optionsRequest.get('authorize')?.setValue(false);
  }

  applicantId1(): boolean {
    if (
      this.optionsRequest.get('applicant_id')?.valid &&
      this.optionsRequest.controls['applicant_id'].value['applicant_type_id'] !== 1 &&
      this.optionsRequest.controls['applicant_id'].value['applicant_type_id'] !== 6
    ) {
      return true;
    } else {
      this.optionsRequest.get('authorize')?.setValue(true);
      return false;
    }
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  getRequest() {
    this.getRequestList(this.optionsRequest.controls['applicant_id'].value['applicant_type_id']);
  }

  getApplicantList() {
    this.userService.getApplicantTypesList().subscribe({
      next: (response: BodyResponse<ApplicantTypeList[]>) => {
        if (response.code === 200) {
          //this.applicantList = response.data;
          this.applicantList = response.data.filter(obj => obj.is_active !== 0);
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }
  getRequestList(payload: number) {
    this.userService.getRequestsTypeByApplicantType(payload).subscribe({
      next: (response: BodyResponse<RequestTypeList[]>) => {
        if (response.code === 200) {
          //this.requestList = response.data;
          this.requestList = response.data.filter(obj => obj.is_active !== 0);
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  sendOptions() {
    localStorage.setItem('visitedFirstPage', 'true');
    localStorage.setItem(
      'applicant-type',
      JSON.stringify(this.optionsRequest.controls['applicant_id'].value)
    );
    localStorage.setItem(
      'request-type',
      JSON.stringify(this.optionsRequest.controls['request_id'].value)
    );

    if (
      this.optionsRequest.controls['applicant_id'].value.applicant_type_id === 1 &&
      this.optionsRequest.controls['request_id'].value.request_type_id === 21
    ) {
      console.log('bienn');
      window.open(
        'https://docs.google.com/forms/d/e/1FAIpQLSc11ps8y0lrKKZEa83wtJC2VrtoSe7p1IMXfeM2bzDSxFagdg/viewform',
        '_blank'
      ); // Abre un enlace en una nueva pestaña
      // window.location.href =
      //   'https://docs.google.com/forms/d/e/1FAIpQLSc11ps8y0lrKKZEa83wtJC2VrtoSe7p1IMXfeM2bzDSxFagdg/viewform'; //abre en la misma
    } else {
      this.router.navigate([RoutesApp.REQUEST_FORM]);
    }
  }
  closeDialogDataT(value: boolean) {
    this.visibleDialogDataT = false;
  }
  openDataTreatment() {
    this.visibleDialogDataT = true;
  }
  setParameterDataT(dataTreatment: boolean) {
    this.optionsRequest.get('authorize')?.setValue(dataTreatment);
  }
}
