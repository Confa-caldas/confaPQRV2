import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AfiliationCompanyList, AfiTemplateValidationList, Pagination, PaginationFilter  } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-company',
  templateUrl: './afiliation-company.component.html',
  styleUrl: './afiliation-company.component.scss'
})
export class AfiliationCompanyComponent {
data!: IRequestManager[];
  afiTemplateValidationList!: AfiTemplateValidationList[];
  afiliationCompanyList!: AfiliationCompanyList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  afiTemplateValidation_details!: AfiTemplateValidationList;
  afiliationCompany_details!: AfiliationCompanyList;
  enableAction: boolean = false;
  read_only: boolean = false;
  enableCreate: boolean = false;
  informative: boolean = false;
  severity = '';

  //paginador
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  // Filtro
searchByOptions = [
  { label: 'NIT', value: 'nit' },
  { label: 'Nombre empresa', value: 'nombre' },
];
searchBy: 'nit' | 'nombre' = 'nit';
searchText: string = '';

// Lista filtrada (lo que pinta la tabla)
filteredAfiliationCompanyList: AfiliationCompanyList[] = [];

  constructor(
    private userService: Users,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getAfiliationCompanyTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getAfiliationCompanyTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAfiliationCompanyTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAfiliationCompanyTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getAfiliationCompanyTablePagination() {
    const q = this.searchText?.trim();

    const payload: PaginationFilter = {
      page: this.page,
      page_size: this.rows,
      ...(q ? { search_by: this.searchBy, search_text: q } : {})
    };
    this.userService.getAfiliationCompanyListPagination(payload).subscribe({
      next: (response: BodyResponse<AfiliationCompanyList[]>) => {
        if (response.code === 200) {
          this.afiliationCompanyList = response.data;
          this.totalRows = Number(response.message);

          this.afiliationCompanyList.forEach(item => {
            item.esta_activa = item.esta_activa;
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

  inActiveAfiCompany(afiliationCompany_details: AfiliationCompanyList) {
    if (!afiliationCompany_details.permite_afiliaciones_masivas) {
      this.message = '¿Seguro que desea Inactivar las afiliaciones masivas?';
      this.visibleDialog = true;
      afiliationCompany_details.permite_afiliaciones_masivas = false;
    } else {
      this.message = '¿Seguro que desea Activar las afiliaciones masivas?';
      this.visibleDialog = true;
      afiliationCompany_details.permite_afiliaciones_masivas = true;
    }
    this.afiliationCompany_details = afiliationCompany_details;
  }
  displayAfiTemplateValidation(afiTemplateValidation_details: AfiTemplateValidationList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles del campo validación de plantilla afiliación masiva';
    this.read_only = true;
    this.enableCreate = false;
    this.afiTemplateValidation_details = afiTemplateValidation_details;
  }
  editAfiTemplateValidation(afiTemplateValidation_details: AfiTemplateValidationList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el campo validación de plantilla afiliación masiva';
    this.read_only = false;
    this.enableCreate = false;
    this.afiTemplateValidation_details = afiTemplateValidation_details;
  }
  createAfiTemplateValidation() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear empresa afiliación masiva';
    this.read_only = false;
    this.enableCreate = true;

    
  }

  closeDialogGender(value: boolean) {
    this.visibleDialogCategory = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }
  setParameter(afiliationCompany_details: AfiliationCompanyList) {

    if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.afiliationCompanyList.some(obj => obj.numero_documento === afiliationCompany_details.numero_documento)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un campo con ese documento ' + afiliationCompany_details.numero_documento;
        this.severity = 'danger';
        this.visibleDialogCategory = false;

      } else {
        this.userService.createAfiCompanyValidation(afiliationCompany_details).subscribe({
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
  }

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      this.userService.inactivateAfiCompany(this.afiliationCompany_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.afiliationCompany_details.permite_afiliaciones_masivas = true)) {
              this.afiliationCompany_details.permite_afiliaciones_masivas = false;
            } else {
              this.afiliationCompany_details.permite_afiliaciones_masivas = true;
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
    } else {
      this.ngOnInit();
    }
  }


applyServerFilter(): void {
  this.first = 0;
  this.page = 1;
  this.getAfiliationCompanyTablePagination();
}

clearServerFilter(): void {
  this.searchBy = 'nit';
  this.searchText = '';
  this.first = 0;
  this.page = 1;
  this.getAfiliationCompanyTablePagination();
}


}
