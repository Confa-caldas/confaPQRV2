import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  AssociateApplicantRequest,
  AssociationApplicantRequestList,
  Pagination,
  RequestTypeList,
  AssociationRequestUserList,
  AssociateRequestUser,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-requestype-manager-associate',
  templateUrl: './requestype-manager-associate.component.html',
  styleUrl: './requestype-manager-associate.component.scss',
})
export class RequestypeManagerAssociateComponent implements OnInit {
  requestTypeList!: RequestTypeList[];
  applicantTypeList!: ApplicantTypeList[];
  applicantTypeRequestsList!: AssociationApplicantRequestList[];
  applicant_request_association!: AssociationApplicantRequestList;
  ingredient!: string;
  visibleDialog = false;
  visibleDialogSelector = false;
  visibleDialogAlert = false;
  message = '';
  buttonmsg = '';
  parameter = [''];
  enableAction: boolean = false;
  informative: boolean = false;
  severity = '';
  associationRequestUserList!: AssociationRequestUserList[];
  associateRequestUser: AssociateRequestUser[] = [];
  association_request_user!: AssociationRequestUserList;
  //paginador
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // this.getApplicantTypeRequestsAssociation();
    this.getRequestsUserAssociation();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getRequestsUserAssociation();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getRequestsUserAssociation();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getRequestsUserAssociation();
  }

  //Metodo para listar todas las asociaciones de tipo y usuarios
  getRequestsUserAssociation() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getRequestsUserAssociation(payload).subscribe({
      next: (response: BodyResponse<AssociationRequestUserList[]>) => {
        if (response.code === 200) {
          console.log(response.data);
          this.associationRequestUserList = response.data;
          this.totalRows = Number(response.message);
          this.associationRequestUserList.forEach(item => {
            item.is_active = item.is_active === 1 ? true : false;
          });
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
  setParameter(inputValue: AssociateRequestUser) {
    if (!this.enableAction) {
      return;
    } else {
      if (
        this.associateRequestUser.some(
          obj =>
            obj.request_type_id === inputValue.request_type_id && obj.user_id === inputValue.user_id
        )
      ) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe esa asociación';
        this.severity = 'danger';
      } else {
        this.userService.createAssociationRequestUser(inputValue).subscribe({
          next: (response: BodyResponse<string>) => {
            if (response.code === 200) {
              this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
            } else {
              this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            }
          },
          error: (err: any) => {
            console.log(err);
          },
          complete: () => {
            this.ngOnInit();
            console.log('La suscripción ha sido completada.');
          },
        });
      }
    }
    this.ngOnInit();
  }

  in_active_association(association_request_user: AssociationRequestUserList) {
    if (!association_request_user.is_active) {
      this.message = '¿Seguro que desea Inactivar la relación del solicitante con la solicitud?';
      this.visibleDialog = true;
      association_request_user.is_active = 0;
    } else {
      this.message = '¿Seguro que desea Activar la relación del solicitante con la solicitud?';
      this.visibleDialog = true;
      association_request_user.is_active = 1;
    }
    this.association_request_user = association_request_user;
  }
  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      this.userService.inactivateAssociationRequestUser(this.association_request_user).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.association_request_user.is_active = 1)) {
              this.association_request_user.is_active = 0;
            } else {
              this.association_request_user.is_active = 1;
            }
          }
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {
          this.ngOnInit();
          console.log('La suscripción ha sido completada.');
        },
      });
    }
    this.ngOnInit();
  }

  closeDialogSelector(value: boolean) {
    this.visibleDialogSelector = false;
    this.enableAction = value;
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }

  associateRequestsType() {
    this.visibleDialogSelector = true;
    this.buttonmsg = 'Asociar';
    this.parameter = ['Tipo de solicitud', 'Gestores'];
    this.message = 'Asociar solicitudes a gestores';
  }
}
