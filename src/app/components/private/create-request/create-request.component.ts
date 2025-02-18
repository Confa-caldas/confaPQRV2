import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  RequestTypeList,
  UserEnvironment,
  ProcessRequest,
} from '../../../models/users.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Router } from '@angular/router';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.component.html',
  styleUrl: './create-request.component.scss',
})
export class CreateRequestComponent {
  optionsRequest: FormGroup;
  applicantList!: ApplicantTypeList[];
  requestList!: RequestTypeList[];
  userEnvironment!: UserEnvironment[];
  visibleDialogDataT = false;

  transactionId: string = '';
  ip: string = '';
  userEnvironmentData: any;

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

  async getUserIp(): Promise<string> {
    try {
      // Servicio para obtener la IP
      const data = await this.userService.getIpAddress().toPromise();
      const ip = data.ip || 'No disponible';
      return ip; // Retornamos el objeto con los datos del entorno
    } catch (err) {
      console.error('Error obteniendo la IP', err);
      throw err; // Rechazamos la promesa en caso de error
    }
  }

  async sendOptions() {
    let ip: string;

    try {
      ip = await this.getUserIp(); // Intentamos obtener el entorno del usuario
    } catch (err) {
      console.error('Error obteniendo el entorno del usuario:', err);
      // Si ocurre un error, usamos valores por defecto
      ip = 'No disponible';
    }

    this.transactionId = uuidv4(); // Genera un identificador único

    localStorage.setItem('visitedFirstPage', 'true');
    localStorage.setItem(
      'applicant-type',
      JSON.stringify(this.optionsRequest.controls['applicant_id'].value)
    );
    localStorage.setItem(
      'request-type',
      JSON.stringify(this.optionsRequest.controls['request_id'].value)
    );
    localStorage.setItem('id-transaction', this.transactionId);

    if (
      this.optionsRequest.controls['applicant_id'].value.applicant_type_id === 1 &&
      this.optionsRequest.controls['request_id'].value.request_type_id === 21
    ) {
      window.open(
        'https://docs.google.com/forms/d/e/1FAIpQLSc11ps8y0lrKKZEa83wtJC2VrtoSe7p1IMXfeM2bzDSxFagdg/viewform',
        '_blank'
      );
    } else {
      const payload: ProcessRequest = {
        operation: 'insert',
        transaction_id: this.transactionId,
        status: 'Iniciado',
        navigator: navigator.userAgent || 'No disponible',
        leng_nav: navigator.language || 'No disponible',
        ip: ip,
        resolution: `${window.screen.width}x${window.screen.height}` || 'No disponible',
        platform: navigator.platform || 'No disponible',
      };

      console.log(payload);

      this.userService.registerProcessRequest(payload).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            console.log('Registro exitoso en log de proceso de solicitud');
          } else {
            console.log('Error registrando en log de proceso de solicitud');
          }
        },
        error: err => {
          console.error('Error consumiendo el servicio de registro request:', err);
        },
      });

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
