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

  /*
  documents: DocumentRelation[] = [
    { id: 1, documentName: 'Cédula', mandatory: true, status: 'Activo' },
    { id: 2, documentName: 'Certificado Laboral', mandatory: true, status: 'Activo' },
    { id: 3, documentName: 'Foto', mandatory: false, status: 'Inactivo' },
  ];
  */
  documents: DocumentRelation[] = [];

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

  onRequestTypeChange(event: any) {
  const selectedId = event.value;
  console.log('📋 Tipo de solicitud seleccionado:', selectedId);

  if (selectedId) {
    this.selectedRequestTypeId = selectedId;
    this.loadDocumentsForRequestType();
  } else {
    this.documents = []; // Si se limpia el dropdown
  }
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


openDialog() {
  console.log("Entroooo: ", this.selectedRequestTypeId)
  this.userService.getDocumentsByRequestType(this.selectedRequestTypeId).subscribe({
    next: (res: any) => {
      if (res.code === 200) {
        this.availableDocuments = res.data.available;
        this.associatedDocuments = res.data.associated;
      }
      this.displayDialog = true;
    },
    error: (err) => {
      console.error('Error al cargar los documentos:', err);
    }
  });
}


  onAssociationChange() {
    console.log("Documentos asociados en UI:", this.associatedDocuments);
  }

  // Guardar relaciones
  saveAssociations() {
  const payload = {
    request_type_id: this.selectedRequestTypeId,
    document_type_ids: this.associatedDocuments.map(d => d.document_type_id)
  };

  this.userService.saveRequestTypeDocuments(payload).subscribe({
    next: (res: any) => {
      if (res.code === 200) {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Asociaciones guardadas correctamente' });
        this.displayDialog = false;
        this.loadDocumentsForRequestType(); // refresca tu tabla o lista
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No se pudieron guardar las asociaciones' });
      }
    },
    error: (err) => {
      console.error(err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al guardar las asociaciones' });
    }
  });
}

loadDocumentsForRequestType() {
  if (!this.selectedRequestTypeId) return;

  this.userService.getDocumentsByRequestType(this.selectedRequestTypeId).subscribe({
    next: (res: any) => {
      console.log('Respuesta de Lambda:', res);

      if (res.code === 200 && res.data && Array.isArray(res.data.associated)) {
        this.documents = res.data.associated.map((doc: any) => ({
          documentName: doc.document_type_description,
          mandatory: doc.is_required,
          status: doc.is_active ? 'Activo' : 'Inactivo'
        }));
      } else {
        this.documents = [];
      }
    },
    error: (err) => {
      console.error('Error al cargar los documentos asociados:', err);
      this.documents = [];
    }
  });
}


  
}
