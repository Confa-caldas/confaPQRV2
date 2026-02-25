import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { MunicipalityList, Pagination, RelationshipList } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-relationship',
  templateUrl: './relationship.component.html',
  styleUrl: './relationship.component.scss'
})
export class RelationshipComponent {
  data!: IRequestManager[]; 
  municipalityList!: MunicipalityList[];
  relationshipList!: RelationshipList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  municipality_details!: MunicipalityList;
  relationship_details!: RelationshipList;
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

  constructor(
    private userService: Users,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getRelationshipTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getRelationshipTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getRelationshipTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getRelationshipTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  getRelationshipTablePagination() {
  const payload: Pagination = {
    page: this.page,
    page_size: this.rows,
  };

  this.userService.getRelationshipListPagination(payload).subscribe({
    next: (response: BodyResponse<RelationshipList[]>) => {
      if (response.code === 200) {

        this.relationshipList = (response.data ?? []).map(r => ({
        ...r,
        adjuntos: (r.adjuntos ?? []).map(a => ({
        ...a,
        id: (a as any).id ?? (a as any).id_tipo_adjunto
        })),
        adjuntos_texto: (r.adjuntos ?? [])
          .map(a => a?.nombre_documento)
          .filter(Boolean)
          .join(', ')
        }));

        this.totalRows = Number(response.message);

      } else {
        this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
      }
    },
    error: (err: any) => console.log(err),
    complete: () => console.log('La suscripción ha sido completada.'),
  });
}


  inActiveRelationship(relationship_details: RelationshipList) {
    if (!relationship_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el parentesco?';
      this.visibleDialog = true;
      relationship_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el parentesco?';
      this.visibleDialog = true;
      relationship_details.esta_activo = true;
    }
    this.relationship_details = relationship_details;
  }
  displayRelationship(relationship_details: RelationshipList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles del parentesco';
    this.read_only = true;
    this.enableCreate = false;
    this.relationship_details = relationship_details;
  }
  editRelationship(relationship_details: RelationshipList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el paresntesco';
    this.read_only = false;
    this.enableCreate = false;
    this.relationship_details = relationship_details;
  }
  createRelationship() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear el parentesco';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogRelationship(value: boolean) {
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
  setParameter(relationship_details: RelationshipList) {
    if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.relationshipList.some(obj => obj.parentesco === relationship_details.parentesco)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un parentesco con ese nombre ' + relationship_details.parentesco;
        this.severity = 'danger';
      } else {
        this.userService.createRelationship(relationship_details).subscribe({
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
    } else {
      this.userService.modifyRelationship(relationship_details).subscribe({
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

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      this.userService.inactivateRelationship(this.relationship_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.relationship_details.esta_activo = true)) {
              this.relationship_details.esta_activo = false;
            } else {
              this.relationship_details.esta_activo = true;
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
}
