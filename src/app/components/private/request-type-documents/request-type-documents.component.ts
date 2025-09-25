import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  RequestTypeList,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';

interface RequestType {
  id: number;
  name: string;
}

interface DocumentRelation {
  id: number;
  documentName: string;
  mandatory: boolean;
  status: string;
}

@Component({
  selector: 'app-request-type-documents',
  templateUrl: './request-type-documents.component.html',
  styleUrls: ['./request-type-documents.component.scss']
})
export class RequestTypeDocumentsComponent implements OnInit {

  requestTypeList!: RequestTypeList[];
  selectedRequestTypeId?: number; // Guardará el id del tipo seleccionado

  selectedRequestType: RequestType | null = null;

  availableDocuments: any[] = []; // Documentos disponibles
  associatedDocuments: any[] = []; // Documentos asociados

  documents: DocumentRelation[] = [
    { id: 1, documentName: 'Cédula', mandatory: true, status: 'Activo' },
    { id: 2, documentName: 'Certificado Laboral', mandatory: true, status: 'Activo' },
    { id: 3, documentName: 'Foto', mandatory: false, status: 'Inactivo' },
  ];

  displayDialog: boolean = false;
  documentForm!: FormGroup;

  constructor(private fb: FormBuilder,
    private userService: Users,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getRequestTypeList();

    this.documentForm = this.fb.group({
      documentName: [''],
      mandatory: [false],
      status: ['Activo']
    });
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  getRequestTypeList() {
      this.userService.getRequestTypesList().subscribe({
        next: (response: BodyResponse<RequestTypeList[]>) => {
          if (response.code === 200) {
            this.requestTypeList = response.data;
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

  // Cargar documentos asociados al cambiar de request type
  /*
  loadAssociatedDocuments() {
    if (!this.selectedRequestTypeId) return;

    this.userService.getRequestTypeDocuments(this.selectedRequestTypeId).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.associatedDocuments = res.data;
        }
      },
      error: (err) => console.error(err)
    });
  } */

  // Abrir modal y cargar pickList
  /*
  openDialog() {
    this.userService.getDocumentsTypesList().subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          const allDocs = res.data;

          // cargar asociados
          this.userService.getRequestTypeDocuments(this.selectedRequestTypeId).subscribe({
            next: (resp: any) => {
              if (resp.code === 200) {
                this.associatedDocuments = resp.data;

                // disponibles = todos - asociados
                this.availableDocuments = allDocs.filter(doc => 
                  !this.associatedDocuments.find(ad => ad.document_type_id === doc.document_type_id)
                );
              }
              this.displayDialog = true;
            }
          });
        }
      }
    });
  }
    */

  openDialog() {
  this.userService.getDocumentsTypesList().subscribe({
    next: (res: any) => {
      if (res.code === 200) {
        this.availableDocuments = res.data;  // lo que venga del servicio
        this.associatedDocuments = [];       // vacío por ahora para probar
      }
      this.displayDialog = true;
    }
  });
}


  onAssociationChange() {
    console.log("Documentos asociados en UI:", this.associatedDocuments);
  }

  // Guardar relaciones
  /*
  saveAssociations() {
    const payload = {
      request_type_id: this.selectedRequestTypeId,
      document_ids: this.associatedDocuments.map(d => d.document_type_id)
    };

    this.userService.saveRequestTypeDocuments(payload).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Asociaciones guardadas' });
          this.displayDialog = false;
          this.loadAssociatedDocuments(); // refrescar la tabla
        }
      },
      error: (err) => console.error(err)
    });
  } */
  
}
