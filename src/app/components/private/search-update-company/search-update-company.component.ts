import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  FilterRequests,
  RequestStatusList,
  RequestTypeList,
  RequestsList,
  UserList,
  IsPriority,
  FilterCompanyUpdate,
  CompanyUpdateRecord,
} from '../../../models/users.interface';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';
import { formatDate } from '@angular/common';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-search-update-company',
  templateUrl: './search-update-company.component.html',
  styleUrl: './search-update-company.component.scss',
})
export class SearchUpdateCompanyComponent implements OnInit {
  requestList: CompanyUpdateRecord[] = [];
  aplicantList: ApplicantTypeList[] = [];
  requestTypeList: RequestTypeList[] = [];
  userList: UserList[] = [];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogInput = false;
  message = '';
  message2 = '';
  buttonmsg = '';
  parameter = [''];
  request_details!: RequestsList;
  selectedRequests!: RequestsList[];
  informative: boolean = false;
  severity = '';
  visibleDialogAlert = false;
  statusOptions!: string[];
  daysOption!: number[];
  selectedDaysOptions!: number[];
  selectedStatusOptions!: string[];
  enableAssign: boolean = false;
  loading: boolean = true;
  PERFIL!: string;
  statusList: RequestStatusList[] = [];
  formGroup: FormGroup<any> = new FormGroup<any>({});
  mensajeReasignacion: string = '';
  user: string = '';
  //paginador
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  //Para mostrar la informacion de actualizacion de empresa
  selectedRecord: CompanyUpdateRecord | null = null;
  modalVisible: boolean = false;
  preSignedUrlDownload: string = '';
  viewerType: 'google' | 'office' | 'image' | 'pdf' = 'google';
  isSpinnerVisible = false;
  displayPreviewModal: boolean = false;
  updateTypeList: { value: number; name: string }[] = [];
  yesNoOptions = [
    { label: 'Sí', value: 'SI' },
    { label: 'No', value: 'NO' },
  ];
  selectedGestion: string | null = null;
  gestionObservacion: string = '';
  showValidationError: boolean = false;

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {
    this.formGroup = new FormGroup({
      dates_range: new FormControl(null),
      filing_number: new FormControl(null),
      doc_id: new FormControl(null),
      applicant_name: new FormControl(null),
      request_days: new FormControl(null),
      applicant_type_id: new FormControl(null),
      request_type_id: new FormControl(null),
      assigned_user: new FormControl(null),
      request_status_id: new FormControl(null),
      is_priority: new FormControl(null),
      report_type: new FormControl(null),
    });

    this.formGroup.get('request_status_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.formGroup.get('request_status_id')?.setValue(null);
      }
    });
    this.formGroup.get('applicant_type_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.formGroup.get('applicant_type_id')?.setValue(null);
      }
    });
    this.formGroup.get('assigned_user')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.formGroup.get('assigned_user')?.setValue(null);
      }
    });
    this.formGroup.get('request_type_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.formGroup.get('request_type_id')?.setValue(null);
      }
    });
  }

  ngOnInit() {
    this.user = sessionStorage.getItem(SessionStorageItems.USER) || '';
    this.updateTypeList = [
      {
        value: 0,
        name: 'Actualización Datos Generales',
      },
      {
        value: 1,
        name: 'Representante Legal / Actividad Económica',
      },
    ];
    this.formGroup.get('report_type')?.setValue(0);
    this.formGroup.get('report_type')?.valueChanges.subscribe(value => {
      this.initPaginador();
    });
    const filtrosGuardados = sessionStorage.getItem('filtrosBusqueda');
    const paginacionGuardada = sessionStorage.getItem('estadoPaginacion');

    if (filtrosGuardados) {
      try {
        const filtros = JSON.parse(filtrosGuardados);
        if (filtros && typeof filtros === 'object') {
          // Convertir las fechas de string a Date antes de asignarlas
          if (filtros.dates_range && filtros.dates_range.length === 2) {
            filtros.dates_range = [
              new Date(filtros.dates_range[0]),
              new Date(filtros.dates_range[1]),
            ];
          }

          // Asegurar que assigned_user es un array (necesario para p-multiSelect)
          if (filtros.assigned_user && !Array.isArray(filtros.assigned_user)) {
            filtros.assigned_user = [filtros.assigned_user]; // Convertir en array si no lo es
          }

          // Filtrar valores nulos antes de asignarlos al formGroup
          const valoresValidos = Object.keys(filtros).reduce((acc, key) => {
            if (filtros[key] !== null && filtros[key] !== '') {
              acc[key] = filtros[key];
            }
            return acc;
          }, {} as any);

          this.formGroup.patchValue(valoresValidos);
        }
      } catch (error) {
        console.error('Error al cargar los filtros:', error);
      }
    }

    if (paginacionGuardada) {
      try {
        const paginacion = JSON.parse(paginacionGuardada);
        this.first = paginacion.first || 0;
        this.rows = paginacion.rows || 10;
        this.page = paginacion.page || 1;
      } catch (error) {
        console.error('Error al cargar la paginación:', error);
      }
    }

    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';

    this.searhRequests();
    this.getRequestTypeList();
    this.getUsersList();
    this.loading = false;
  }

  getColor(value: number): string {
    if (value >= 0 && value < 4) {
      return '#01b0ef';
    } else {
      return 'red';
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;

    sessionStorage.getItem('filtrosBusqueda');
    this.searhRequests();
  }
  cleanForm() {
    sessionStorage.removeItem('filtrosBusqueda');

    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.requestList = [];
    this.searhRequests();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.searhRequests();
  }

  searhRequests() {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusqueda');
    const filtros = filtrosGuardados ? JSON.parse(filtrosGuardados) : {};

    const payload: FilterCompanyUpdate = {
      i_date:
        this.formGroup.controls['dates_range'].value?.length > 0
          ? this.convertDates(this.formGroup.controls['dates_range'].value[0])
          : filtros['dates_range']?.length > 0
            ? this.convertDates(filtros['dates_range'][0])
            : null,

      f_date:
        this.formGroup.controls['dates_range'].value?.length > 0
          ? this.convertDates(this.formGroup.controls['dates_range'].value[1])
          : filtros['dates_range']?.length > 0
            ? this.convertDates(filtros['dates_range'][1])
            : null,

      doc_id:
        this.formGroup.controls['doc_id'].value &&
        this.formGroup.controls['doc_id'].value.length > 0
          ? this.formGroup.controls['doc_id'].value
          : filtros['doc_id'] || null,

      applicant_name:
        this.formGroup.controls['applicant_name'].value?.trim().length > 0
          ? this.formGroup.controls['applicant_name'].value
          : filtros['applicant_name'] || null,

      report_type:
        this.formGroup.controls['report_type'].value !== null &&
        this.formGroup.controls['report_type'].value !== undefined
          ? this.formGroup.controls['report_type'].value
          : filtros['report_type'] ?? null,
      page: this.page,
      page_size: this.rows,
    };

    this.getRequestListByFilter(payload);
  }

  convertDates(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
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
  getUsersList() {
    this.userService.getUsersList().subscribe({
      next: (response: BodyResponse<UserList[]>) => {
        if (response.code === 200) {
          this.userList = response.data;
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

  // redirectDetails(request_id: number) {
  //   localStorage.removeItem('route');
  //   localStorage.setItem('route', this.router.url);
  //   this.router.navigate([RoutesApp.REQUEST_DETAILS, request_id]);
  // }

  showDetails(record: CompanyUpdateRecord): void {
    this.selectedRecord = record;
    this.modalVisible = true;
  }

  getRequestListByFilter(payload: FilterCompanyUpdate) {
    this.userService.getCompanyUpdateListByFilter(payload).subscribe({
      next: (response: BodyResponse<CompanyUpdateRecord[]>) => {
        if (response.code === 200) {
          this.requestList = response.data.map(item => {
            const createdAtFormatted = formatDate(item.created_at, 'MM/dd/yyyy', 'en-US');
            const updatedAtFormatted = formatDate(item.updated_at, 'MM/dd/yyyy', 'en-US');

            const documentLinks: { url: string; fileName: string }[] = [];

            const extractFileName = (url: string) => {
              return url.substring(url.lastIndexOf('/') + 1).split('@')[0];
            };

            if (item.legal_representative_document_path) {
              item.legal_representative_document_path.split(',').forEach(url => {
                documentLinks.push({ url, fileName: extractFileName(url) });
              });
            }

            if (item.economic_activity_rut_path) {
              item.economic_activity_rut_path.split(',').forEach(url => {
                documentLinks.push({ url, fileName: extractFileName(url) });
              });
            }

            return {
              ...item,
              created_at: createdAtFormatted,
              updated_at: updatedAtFormatted,
              created_at_date: new Date(item.created_at),
              updated_at_date: new Date(item.updated_at),
              documentLinks,
              management_result: item.management_result ?? null,
              management_observation: item.management_observation ?? '',
              alreadyManaged: !!item.management_result,
            };
          });
          this.totalRows = Number(response.message);
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => console.log(err),
      complete: () => console.log('La suscripción ha sido completada.'),
    });
  }

  extractFileSize(fileSize: string): number {
    const sizeMatch = fileSize.match(/([\d.]+)(KB|MB)/i);
    if (!sizeMatch) return 0;

    const numericSize = parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2].toUpperCase();

    return unit === 'MB' ? numericSize * 1024 : numericSize;
  }

  handleBtn(fileSize: string, fileExt: string): boolean {
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const maxSizeKB = 30 * 1024;

    if (['xls', 'xlsx', 'doc', 'docx'].includes(fileExt)) {
      return true;
    }
    const fileSizeKB = this.extractFileSize(fileSize);

    return allowedExtensions.includes(fileExt) && fileSizeKB < maxSizeKB;
  }

  async getPreSignedUrlToDownload(url: string, file_name: string, is_download: boolean) {
    const payload = { url: url };

    this.userService.getUrlSigned(payload, 'download').subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.preSignedUrlDownload = response.data;

          if (this.preSignedUrlDownload) {
            this.viewerType = this.getViewerType(file_name);

            if (!is_download) {
              if (this.viewerType === 'pdf') {
                this.isSpinnerVisible = true;
                this.displayFileInTab(this.preSignedUrlDownload, file_name);
              } else {
                this.displayPreviewModal = true;
              }
            } else {
              this.downloadFileS3(this.preSignedUrlDownload, file_name);
            }
          } else {
            console.error('Error: La URL prefirmada es nula o vacía.');
            this.showSuccessMessage('error', 'Fallida', 'No se pudo obtener la URL del archivo.');
          }
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.error('Error al obtener la URL prefirmada:', err);
        this.showSuccessMessage('error', 'Fallida', 'Error en la solicitud.');
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  getViewerType(file_name: string): 'google' | 'office' | 'image' | 'pdf' {
    const extension = file_name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
      case 'doc':
      case 'xlsx':
      case 'xls':
        return 'office';
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'image';
      default:
        return 'google'; // Valor predeterminado
    }
  }

  displayFileInTab(preSignedUrl: string, file_name: string): void {
    this.userService
      .downloadFileFromS3(preSignedUrl)
      .toPromise()
      .then((blob: Blob | undefined) => {
        if (blob) {
          return this.blobToBase64(blob);
        } else {
          throw new Error('Downloaded file is undefined');
        }
      })
      .then((base64String: string) => {
        const fileType = file_name.split('.');
        const file_extension = fileType[fileType.length - 1];
        const dataUrl = 'data:application/pdf;base64,' + base64String;
        this.convertBase64ToBlobAndOpenInNewTab(base64String, file_name, file_extension);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data: string = reader.result as string;
        // Remove the header (data:image/png;base64,) to get only the base64-encoded content
        const base64Content = base64Data.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = error => {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  }
  convertBase64ToBlobAndOpenInNewTab(
    base64String: string,
    fileName: string,
    file_extension: string
  ): void {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    let mimeType;
    if (file_extension === 'pdf') {
      mimeType = 'application/' + file_extension;
    } else {
      mimeType = 'image/' + file_extension;
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    //const newTab = window.open(url, '_blank');

    // Definir las dimensiones de la ventana emergente
    const windowWidth = 800;
    const windowHeight = 600;

    // Calcular la posición centrada
    const left = window.screen.width / 2 - windowWidth / 2;
    const top = window.screen.height / 2 - windowHeight / 2;

    // Definir las características de la nueva ventana con las posiciones calculadas
    const windowFeatures = `width=${windowWidth},height=${windowHeight},scrollbars=yes,resizable=yes,left=${left},top=${top}`;
    this.isSpinnerVisible = false;
    // Abrir la nueva ventana con las características definidas
    const newWindow = window.open(url, 'miventana', windowFeatures);

    URL.revokeObjectURL(url);
  }

  downloadFileS3(preSignedUrl: string, file_name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.userService.downloadFileFromS3(preSignedUrl).subscribe({
        next: (blob: Blob) => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = file_name;
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
            resolve();
          }, 0);
        },
        error: (err: any) => {
          console.error(`Error al descargar el archivo ${file_name}:`, err);
          reject(err);
        },
      });
    });
  }

  async downloadAllFiles(attachments: { url: string; fileName: string }[]) {
    if (!attachments || attachments.length === 0) {
      this.showSuccessMessage('error', 'Fallida', 'No hay archivos para descargar.');
      return;
    }

    this.isSpinnerVisible = true; // Mostrar el spinner

    // Convertir cada solicitud en una promesa para usar Promise.all
    const downloadPromises = attachments.map(attachment => {
      return new Promise<void>((resolve, reject) => {
        const cleanUrl = attachment.url.split('@')[0];
        const payload = { url: cleanUrl };
        console.log('Nombre archivo: ' + attachment.fileName);

        this.userService.getUrlSigned(payload, 'download').subscribe({
          next: (response: BodyResponse<string>): void => {
            if (response.code === 200 && response.data) {
              this.downloadFileS3(response.data, attachment.fileName)
                .then(() => resolve())
                .catch(err => reject(err));
            } else {
              console.error(`Error al obtener la URL prefirmada para ${attachment.fileName}`);
              this.showSuccessMessage(
                'error',
                'Fallida',
                `No se pudo obtener el archivo: ${attachment.fileName}`
              );
              reject(new Error(`No se pudo obtener el archivo: ${attachment.fileName}`));
            }
          },
          error: (err: any) => {
            console.error(`Error en la solicitud para ${attachment.fileName}:`, err);
            this.showSuccessMessage(
              'error',
              'Fallida',
              `Error en la descarga de ${attachment.fileName}`
            );
            reject(err);
          },
        });
      });
    });

    // Esperar a que todas las descargas finalicen
    try {
      await Promise.all(downloadPromises);
      this.showSuccessMessage('success', 'Éxito', 'Descarga completada con éxito.');
    } catch (error) {
      console.error('Ocurrió un error en alguna de las descargas', error);
    }

    this.isSpinnerVisible = false; // Ocultar el spinner cuando todo termine
    console.log('Todas las descargas han finalizado.');
  }

  exportToExcel(): void {
    if (!this.requestList || this.requestList.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'No hay datos para exportar.',
      });
      return;
    }

    this.isSpinnerVisible = true;

    setTimeout(() => {
      const reportType = this.formGroup.get('report_type')?.value;

      const exportData = this.requestList.flatMap(record => {
        const formattedDate = new Date(record.created_at).toISOString().slice(0, 10);

        if (reportType === 0) {
          return [
            {
              'TIPO DOCUMENTO': record.document_type,
              'NUMERO DOCUMENTO': record.document_number,
              DV: record.verification_digit,
              'RAZON SOCIAL': record.business_name,
              'NOMBRE COMERCIAL': record.trade_name,
              DEPARTAMENTO: record.department,
              MUNICIPIO: record.municipality,
              DIRECCIÓN: record.address,
              'TELEFONO FIJO': record.landline || '',
              CELULAR: record.mobile_phone,
              'CELULAR ALTERNO': record.alternate_mobile_phone || '',
              'CORREO ELECTRONICO': record.email,
              'CORREO ELECTRONICO ALTERNO': record.alternate_email || '',
              'FECHA ACTUALIZACIÓN': formattedDate,
            },
          ];
        }

        if (reportType === 1 && record.management_result !== 'SI') {
          return [];
        }

        const rows: any[] = [];

        if (record.updated_legal_representative) {
          rows.push({
            'TIPO DOCUMENTO': record.document_type,
            'NUMERO DOCUMENTO': record.document_number,
            DV: record.verification_digit,
            'RAZON SOCIAL': record.business_name,
            'NOMBRE COMERCIAL': record.trade_name,
            'TIPO DOCUMENTO REPRESENTANTE LEGAL': record.legal_representative_document_type,
            'NUMERO DOCUMENTO REPRESENTANTE LEGAL': record.legal_representative_document_number,
            'PRIMER NOMBRE REPRESENTANTE LEGAL': record.legal_representative_first_name,
            'SEGUNDO NOMBRE REPRESENTANTE LEGAL': record.legal_representative_middle_name || '',
            'PRIMER APELLIDO REPRESENTANTE LEGAL': record.legal_representative_last_name,
            'SEGUNDO APELLIDO REPRESENTANTE LEGAL':
              record.legal_representative_second_last_name || '',
            'CODIGO CIIU': '',
            'FECHA ACTUALIZACIÓN': formattedDate,
          });
        }

        if (record.updated_economic_activity) {
          rows.push({
            'TIPO DOCUMENTO': record.document_type,
            'NUMERO DOCUMENTO': record.document_number,
            DV: record.verification_digit,
            'RAZON SOCIAL': record.business_name,
            'NOMBRE COMERCIAL': record.trade_name,
            'TIPO DOCUMENTO REPRESENTANTE LEGAL': '',
            'NUMERO DOCUMENTO REPRESENTANTE LEGAL': '',
            'PRIMER NOMBRE REPRESENTANTE LEGAL': '',
            'SEGUNDO NOMBRE REPRESENTANTE LEGAL': '',
            'PRIMER APELLIDO REPRESENTANTE LEGAL': '',
            'SEGUNDO APELLIDO REPRESENTANTE LEGAL': '',
            'CODIGO CIIU': record.economic_activity_ciiu_code,
            'FECHA ACTUALIZACIÓN': formattedDate,
          });
        }

        return rows.length > 0 ? rows : [];
      });

      if (exportData.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validación',
          detail: 'No hay datos actualizados para exportar.',
        });
        this.isSpinnerVisible = false;
        return;
      }

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      const workbook: XLSX.WorkBook = {
        Sheets: { Empresas: worksheet },
        SheetNames: ['Empresas'],
      };
      const fileName =
        reportType === 0
          ? 'actualizacion_datos_generales.xlsx'
          : 'representante_legal_actividad_economica.xlsx';

      XLSX.writeFile(workbook, fileName);
      this.isSpinnerVisible = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Archivo exportado correctamente.',
      });
    }, 1000);
  }

  onGestionChange(event: any): void {
    this.showValidationError = false;
    if (event.value === 'YES' && this.selectedRecord) {
      this.selectedRecord.management_observation = '';
    }
  }

  saveGestion(): void {
    this.showValidationError = false;

    if (!this.selectedRecord?.management_result) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe seleccionar si la gestión fue exitosa o no',
      });
      return;
    }

    if (
      this.selectedRecord.management_result === 'NO' &&
      (!this.selectedRecord.management_observation ||
        !this.selectedRecord.management_observation.trim())
    ) {
      this.showValidationError = true;
      return;
    }

    const payload = {
      company_update_id: this.selectedRecord.company_update_id,
      management_result: this.selectedRecord.management_result,
      management_observation: this.selectedRecord.management_observation?.trim() || '',
      updated_by: this.user || '',
      user_mail: this.selectedRecord.email,
      user_name: this.selectedRecord.business_name,
    };

    this.userService.updateCompanyManagement(payload).subscribe({
      next: response => {
        if (response.code === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Gestión guardada',
            detail: 'La gestión se guardó correctamente',
          });

          this.modalVisible = false;
          this.getRequestListByFilter(this.formGroup.value);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar la gestión',
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al guardar la gestión',
        });
      },
    });
  }
}
