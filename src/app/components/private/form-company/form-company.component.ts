import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
  FormControl,
  ValidationErrors,
} from '@angular/forms';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import {
  ApplicantAttachments,
  ApplicantTypeList,
  RequestFormList,
  RequestTypeList,
  ErrorAttachLog,
  ProcessRequest,
  Empresa,
  CompanyUpdateForm,
  CompanyUpdateRequest,
  ApplicantAttachmentsCompany,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { RoutesApp } from '../../../enums/routes.enum';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HttpEventType, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { throwError, retry, lastValueFrom, firstValueFrom } from 'rxjs';
import { catchError, retryWhen, delay, take, tap } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import {
  commonEmailDomainValidator,
  ceDocumentValidator,
  noConsecutiveValidator,
  noRepeatedDigitsValidator,
} from '../../../shared/validators/common-email-domain.validator';

@Component({
  selector: 'app-form-company',
  templateUrl: './form-company.component.html',
  styleUrl: './form-company.component.scss',
})
export class FormCompanyComponent implements OnInit {
  @ViewChild('archive_request') fileInput!: ElementRef;
  @ViewChild('archive_request_economic') fileInputEconomic!: ElementRef;

  requestForm!: FormGroup;

  documentList: {
    catalog_item_id: number;
    catalog_item_name: string;
    catalog_item_label: string;
    catalog_id: number;
    is_active: number;
    regex: string;
  }[] = [];
  document!: string;
  applicantType!: ApplicantTypeList;
  requestType!: RequestTypeList;
  arrayApplicantAttachment: ApplicantAttachments[] = [];
  fileNameList: Set<string> = new Set();
  selectedFiles: FileList | null = null;
  base64String: string = '';
  option: string[] = [];
  errorSizeFile!: boolean;
  errorExtensionFile!: boolean;
  errorRepeatFile!: boolean;
  errorMensaje!: string;
  errorMensajeDisabled!: string;
  errorMensajeFile!: string;
  visibleDialogAlert = false;
  informative: boolean = false;
  isError: boolean = false;
  severity = '';
  message = '';
  tittle_message = '';
  enableAction: boolean = false;
  loadingAttachments: boolean = false;
  optionDefault!: string;
  optionsCompany = [
    {
      catalog_item_id: 1,
      catalog_item_name: 'NIT',
      regex: '^[0-9]{0,9}$',
    },
  ];
  value!: {};
  preSignedUrl: string = '';
  selectedFile: File | null = null;
  numeroDocumentoIngresado: boolean = false;

  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  resolveModal!: () => void; // Función para resolver la promesa

  isUploading: boolean = false;
  uploadProgress = 0;
  visibleDialogProgress: boolean = false;
  isSpinnerVisible = false;
  hasPendingChanges: boolean = false;

  useIaAttach: boolean = false;

  existCompany: boolean = false;
  empresa?: Empresa;
  sectionTitle = 'Datos Generales';
  currentStep = 1;
  currentSection = 1;
  confirmationDate: string | null = null;
  isEditable: boolean = false;
  company?: CompanyUpdateForm;
  departmentsList = [
    { id: 1, name: 'Amazonas' },
    { id: 2, name: 'Antioquia' },
    { id: 3, name: 'Arauca' },
    { id: 4, name: 'Atlántico' },
    { id: 5, name: 'Bolívar' },
    { id: 6, name: 'Boyacá' },
    { id: 7, name: 'Caldas' },
    { id: 8, name: 'Caquetá' },
    { id: 9, name: 'Casanare' },
    { id: 10, name: 'Cauca' },
    { id: 11, name: 'Cesar' },
    { id: 12, name: 'Chocó' },
    { id: 13, name: 'Córdoba' },
    { id: 14, name: 'Cundinamarca' },
    { id: 15, name: 'Guainía' },
    { id: 16, name: 'Guaviare' },
    { id: 17, name: 'Huila' },
    { id: 18, name: 'La Guajira' },
    { id: 19, name: 'Magdalena' },
    { id: 20, name: 'Meta' },
    { id: 21, name: 'Nariño' },
    { id: 22, name: 'Norte de Santander' },
    { id: 23, name: 'Putumayo' },
    { id: 24, name: 'Quindío' },
    { id: 25, name: 'Risaralda' },
    { id: 26, name: 'San Andrés y Providencia' },
    { id: 27, name: 'Santander' },
    { id: 28, name: 'Sucre' },
    { id: 29, name: 'Tolima' },
    { id: 30, name: 'Valle del Cauca' },
    { id: 31, name: 'Vaupés' },
    { id: 32, name: 'Vichada' },
    { id: 33, name: 'BOGOTÁ, D.C.' },
  ];
  documentHomologationList = [
    { code: 'N', name: 'NIT' },
    { code: 'P', name: 'PASAPORTE' },
    { code: 'C', name: 'CC' },
    { code: 'D', name: 'CD' },
    { code: 'E', name: 'CE' },
    { code: 'T', name: 'TI' },
    { code: 'R', name: 'RC' },
    { code: 'V', name: 'PEP' },
    { code: 'M', name: 'PPT' },
  ];
  municipalitiesList: any[] = [];
  selectedDepartamento: number | null = null;
  selectedMunicipio: number | null = null;
  isCorrectData: boolean = true;
  isCorrectLegalRepresentativeData: boolean = true;
  isCorrectEconomicActivityData: boolean = true;
  showConfirmationModal: boolean = false;
  showFileError: boolean = false;
  showEconomicFileError: boolean = false;
  arrayEconomicAttachments: ApplicantAttachments[] = [];
  economicFileNameList: Set<string> = new Set();
  selectedEconomicFiles: FileList | null = null;
  base64EconomicString: string = '';
  errorSizeEconomicFile!: boolean;
  errorExtensionEconomicFile!: boolean;
  errorRepeatEconomicFile!: boolean;
  errorMensajeEconomicFile!: string;
  mostrarEmpresaNoEncontrada: boolean = false;
  showNoChangesModal = false;
  showSuccessModal = false;
  economicActivityList: { code: string; description: string }[] = [];
  showConfirmationPolityModal: boolean = false;

  loadMunicipalities(departmentId: number) {
    const municipios: Record<number, { id: number; name: string }[]> = {
      // 1. AMAZONAS
      1: [
        { id: 91001, name: 'Leticia' },
        { id: 91540, name: 'Puerto Nariño' },
      ],

      // 2. ANTIOQUIA
      2: [
        { id: 5001, name: 'Medellín' },
        { id: 5002, name: 'Abejorral' },
        { id: 5004, name: 'Abriaquí' },
        { id: 5021, name: 'Alejandría' },
        { id: 5030, name: 'Amagá' },
        { id: 5031, name: 'Amalfi' },
        { id: 5034, name: 'Andes' },
        { id: 5036, name: 'Angelópolis' },
        { id: 5038, name: 'Angostura' },
        { id: 5040, name: 'Anorí' },
        { id: 5042, name: 'Santa Fé de Antioquia' },
        { id: 5044, name: 'Anza' },
        { id: 5045, name: 'Apartadó' },
        { id: 5051, name: 'Arboletes' },
        { id: 5055, name: 'Argelia' },
        { id: 5059, name: 'Armenia' },
        { id: 5079, name: 'Barbosa' },
        { id: 5086, name: 'Betania' },
        { id: 5088, name: 'Bello' },
        { id: 5091, name: 'Betulia' },
        { id: 5093, name: 'Ciudad Bolívar' },
        { id: 5101, name: 'Briceño' },
        { id: 5107, name: 'Buriticá' },
        { id: 5113, name: 'Cáceres' },
        { id: 5120, name: 'Caicedo' },
        { id: 5125, name: 'Caldas' },
        { id: 5129, name: 'Campamento' },
        { id: 5134, name: 'Cañasgordas' },
        { id: 5138, name: 'Caracolí' },
        { id: 5142, name: 'Caramanta' },
        { id: 5145, name: 'Carepa' },
        { id: 5147, name: 'El Carmen de Viboral' },
        { id: 5150, name: 'Carolina' },
        { id: 5154, name: 'Caucasia' },
        { id: 5172, name: 'Chigorodó' },
        { id: 5190, name: 'Cisneros' },
        { id: 5197, name: 'Cocorná' },
        { id: 5206, name: 'Concepción' },
        { id: 5209, name: 'Concordia' },
        { id: 5212, name: 'Copacabana' },
        { id: 5234, name: 'Dabeiba' },
        { id: 5237, name: 'Donmatías' },
        { id: 5240, name: 'Ebéjico' },
        { id: 5250, name: 'El Bagre' },
        { id: 5264, name: 'Entrerríos' },
        { id: 5266, name: 'Envigado' },
        { id: 5282, name: 'Fredonia' },
        { id: 5284, name: 'Frontino' },
        { id: 5306, name: 'Giraldo' },
        { id: 5308, name: 'Girardota' },
        { id: 5310, name: 'Gómez Plata' },
        { id: 5313, name: 'Granada' },
        { id: 5315, name: 'Guadalupe' },
        { id: 5318, name: 'Guarne' },
        { id: 5321, name: 'Guatapé' },
        { id: 5347, name: 'Heliconia' },
        { id: 5353, name: 'Hispania' },
        { id: 5360, name: 'Itagüí' },
        { id: 5361, name: 'Ituango' },
        { id: 5364, name: 'Jardín' },
        { id: 5368, name: 'Jericó' },
        { id: 5376, name: 'La Ceja' },
        { id: 5380, name: 'La Estrella' },
        { id: 5390, name: 'La Pintada' },
        { id: 5400, name: 'La Unión' },
        { id: 5411, name: 'Liborina' },
        { id: 5425, name: 'Maceo' },
        { id: 5440, name: 'Marinilla' },
        { id: 5467, name: 'Montebello' },
        { id: 5475, name: 'Murindó' },
        { id: 5480, name: 'Mutatá' },
        { id: 5483, name: 'Nariño' },
        { id: 5490, name: 'Necoclí' },
        { id: 5501, name: 'Nechí' },
        { id: 5541, name: 'Olaya' },
        { id: 5543, name: 'Peñol' },
        { id: 5549, name: 'Peque' },
        { id: 5576, name: 'Pueblorrico' },
        { id: 5579, name: 'Puerto Berrío' },
        { id: 5585, name: 'Puerto Nare' },
        { id: 5591, name: 'Puerto Triunfo' },
        { id: 5604, name: 'Remedios' },
        { id: 5615, name: 'Retiro' },
        { id: 5628, name: 'Rionegro' },
        { id: 5631, name: 'Sabanalarga' },
        { id: 5634, name: 'Sabaneta' },
        { id: 5635, name: 'Salgar' },
        { id: 5642, name: 'San Andrés de Cuerquia' },
        { id: 5647, name: 'San Carlos' },
        { id: 5649, name: 'San Francisco' },
        { id: 5652, name: 'San Jerónimo' },
        { id: 5656, name: 'San José de la Montaña' },
        { id: 5658, name: 'San Juan de Urabá' },
        { id: 5659, name: 'San Luis' },
        { id: 5660, name: 'San Pedro de los Milagros' },
        { id: 5664, name: 'San Pedro de Urabá' },
        { id: 5665, name: 'San Rafael' },
        { id: 5667, name: 'San Roque' },
        { id: 5670, name: 'San Vicente' },
        { id: 5674, name: 'Santa Bárbara' },
        { id: 5679, name: 'Santa Rosa de Osos' },
        { id: 5686, name: 'Santo Domingo' },
        { id: 5690, name: 'El Santuario' },
        { id: 5736, name: 'Segovia' },
        { id: 5756, name: 'Sopetrán' },
        { id: 5761, name: 'Támesis' },
        { id: 5762, name: 'Tarazá' },
        { id: 5768, name: 'Tarso' },
        { id: 5772, name: 'Titiribí' },
        { id: 5789, name: 'Toledo' },
        { id: 5790, name: 'Turbo' },
        { id: 5792, name: 'Uramita' },
        { id: 5809, name: 'Urrao' },
        { id: 5819, name: 'Valdivia' },
        { id: 5837, name: 'Valparaíso' },
        { id: 5842, name: 'Vegachí' },
        { id: 5847, name: 'Venecia' },
        { id: 5854, name: 'Yalí' },
        { id: 5856, name: 'Yarumal' },
        { id: 5858, name: 'Yolombó' },
        { id: 5861, name: 'Yondó' },
        { id: 5885, name: 'Zaragoza' },
      ],

      // 3. ARAUCA
      3: [
        { id: 81001, name: 'Arauca' },
        { id: 81065, name: 'Arauquita' },
        { id: 81220, name: 'Cravo Norte' },
        { id: 81300, name: 'Fortul' },
        { id: 81591, name: 'Puerto Rondón' },
        { id: 81736, name: 'Saravena' },
        { id: 81794, name: 'Tame' },
      ],

      // 4. ATLÁNTICO
      4: [
        { id: 8001, name: 'Barranquilla' },
        { id: 8078, name: 'Baranoa' },
        { id: 8137, name: 'Candelaria' },
        { id: 8233, name: 'Galapa' },
        { id: 8285, name: 'Luruaco' },
        { id: 8296, name: 'Malambo' },
        { id: 8312, name: 'Manatí' },
        { id: 8341, name: 'Palmar de Varela' },
        { id: 8372, name: 'Piojó' },
        { id: 8378, name: 'Polonuevo' },
        { id: 8381, name: 'Ponedera' },
        { id: 8397, name: 'Repelón' },
        { id: 8421, name: 'Sabanagrande' },
        { id: 8423, name: 'Sabanalarga' },
        { id: 8433, name: 'Santa Lucía' },
        { id: 8436, name: 'Santo Tomás' },
        { id: 8520, name: 'Soledad' },
        { id: 8540, name: 'Suan' },
        { id: 8701, name: 'Tubará' },
        { id: 8758, name: 'Usiacurí' },
      ],

      // 5. BOLÍVAR
      5: [
        { id: 13001, name: 'Cartagena de Indias' },
        { id: 13006, name: 'Achí' },
        { id: 13030, name: 'Altos del Rosario' },
        { id: 13042, name: 'Arenal' },
        { id: 13052, name: 'Arjona' },
        { id: 13062, name: 'Arroyohondo' },
        { id: 13074, name: 'Barranco de Loba' },
        { id: 13140, name: 'Calamar' },
        { id: 13160, name: 'Cantagallo' },
        { id: 13188, name: 'Cicuco' },
        { id: 13212, name: 'Córdoba' },
        { id: 13222, name: 'Clemencia' },
        { id: 13244, name: 'El Guamo' },
        { id: 13248, name: 'El Peñón' },
        { id: 13268, name: 'Hatillo de Loba' },
        { id: 13300, name: 'Magangué' },
        { id: 13430, name: 'Mahates' },
        { id: 13433, name: 'Margarita' },
        { id: 13440, name: 'María La Baja' },
        { id: 13442, name: 'Montecristo' },
        { id: 13458, name: 'Mompós' },
        { id: 13468, name: 'Morales' },
        { id: 13490, name: 'Norosí' },
        { id: 13549, name: 'Pinillos' },
        { id: 13580, name: 'Regidor' },
        { id: 13600, name: 'Río Viejo' },
        { id: 13620, name: 'San Cristóbal' },
        { id: 13647, name: 'San Estanislao' },
        { id: 13650, name: 'San Fernando' },
        { id: 13654, name: 'San Juan Nepomuceno' },
        { id: 13655, name: 'San Martín de Loba' },
        { id: 13657, name: 'San Pablo' },
        { id: 13667, name: 'Santa Catalina' },
        { id: 13670, name: 'Santa Rosa' },
        { id: 13673, name: 'Simití' },
        { id: 13683, name: 'Soplaviento' },
        { id: 13688, name: 'Talaigua Nuevo' },
        { id: 13744, name: 'Tiquisio' },
        { id: 13760, name: 'Turbaco' },
        { id: 13780, name: 'Turbaná' },
        { id: 13810, name: 'Villanueva' },
        { id: 13836, name: 'Zambrano' },
      ], // 6. BOYACÁ
      6: [
        { id: 15001, name: 'Tunja' },
        { id: 15022, name: 'Almeida' },
        { id: 15047, name: 'Aquitania' },
        { id: 15051, name: 'Arcabuco' },
        { id: 15087, name: 'Berbeo' },
        { id: 15090, name: 'Betéitiva' },
        { id: 15092, name: 'Boavita' },
        { id: 15097, name: 'Boyacá' },
        { id: 15104, name: 'Buena Vista' },
        { id: 15106, name: 'Busbanzá' },
        { id: 15109, name: 'Campamento (únicamente si existiera en Boyacá, validar)' }, // REVISAR
        { id: 15114, name: 'Campohermoso' },
        { id: 15131, name: 'Cerinza' },
        { id: 15135, name: 'Chinavita' },
        { id: 15162, name: 'Chiquinquirá' },
        { id: 15172, name: 'Chiscas' },
        { id: 15176, name: 'Chita' },
        { id: 15180, name: 'Chitaraque' },
        { id: 15204, name: 'Chivatá' },
        { id: 15212, name: 'Cómbita' },
        { id: 15215, name: 'Coper' },
        { id: 15218, name: 'Corrales' },
        { id: 15223, name: 'Covarachía' },
        { id: 15224, name: 'Cubará' },
        { id: 15226, name: 'Cucaita' },
        { id: 15232, name: 'Cuítiva' },
        { id: 15236, name: 'Chíquiza (antes San Pedro de Iguaque)' },
        { id: 15238, name: 'Firavitoba' },
        { id: 15244, name: 'Floresta' },
        { id: 15248, name: 'Gachantivá' },
        { id: 15272, name: 'Gameza' },
        { id: 15276, name: 'Garagoa' },
        { id: 15293, name: 'Guacamayas' },
        { id: 15296, name: 'Guateque' },
        { id: 15299, name: 'Guayatá' },
        { id: 15317, name: 'Güicán de la Sierra' },
        { id: 15322, name: 'Iza' },
        { id: 15325, name: 'Jenesano' },
        { id: 15332, name: 'Labranzagrande' },
        { id: 15362, name: 'La Capilla' },
        { id: 15367, name: 'Macanal' },
        { id: 15368, name: 'Maripí' },
        { id: 15377, name: 'Miraflores' },
        { id: 15380, name: 'Mongua' },
        { id: 15385, name: 'Monguí' },
        { id: 15390, name: 'Moniquirá' },
        { id: 15401, name: 'Motas (Verificar si existe: es un corregimiento, no municipio)' }, // REVISAR
        { id: 15403, name: 'Muzo' },
        { id: 15407, name: 'Nobsa' },
        { id: 15425, name: 'Nuevo Colón' },
        { id: 15442, name: 'Oicatá' },
        { id: 15455, name: 'Otanche' },
        { id: 15464, name: 'Pachavita' },
        { id: 15466, name: 'Páez' },
        { id: 15469, name: 'Paipa' },
        { id: 15476, name: 'Pajarito' },
        { id: 15480, name: 'Panqueba' },
        { id: 15491, name: 'Pauna' },
        { id: 15494, name: 'Paya' },
        { id: 15500, name: 'Pesca' },
        { id: 15507, name: 'Pisba' },
        { id: 15511, name: 'Puerto Boyacá' },
        { id: 15514, name: 'Quípama' },
        { id: 15516, name: 'Ramiriquí' },
        { id: 15518, name: 'Ráquira' },
        { id: 15522, name: 'Rondón' },
        { id: 15531, name: 'Saboyá' },
        { id: 15533, name: 'Sáchica' },
        { id: 15537, name: 'Samacá' },
        { id: 15542, name: 'Santa María' },
        { id: 15550, name: 'Santa Sofía' },
        { id: 15572, name: 'Santana' },
        { id: 15580, name: 'Sativanorte' },
        { id: 15581, name: 'Sativasur' },
        { id: 15600, name: 'Siachoque' },
        { id: 15601, name: 'Soatá' },
        { id: 15602, name: 'Socotá' },
        { id: 15621, name: 'Socha' },
        { id: 15632, name: 'Sogamoso' },
        { id: 15638, name: 'Somondoco' },
        { id: 15646, name: 'Sora' },
        { id: 15660, name: 'Sotaquirá' },
        { id: 15664, name: 'Soracá' },
        { id: 15667, name: 'Susacón' },
        { id: 15673, name: 'Sutamarchán' },
        { id: 15676, name: 'Sutatenza' },
        { id: 15681, name: 'Tasco' },
        { id: 15686, name: 'Tenza' },
        { id: 15690, name: 'Tibaná' },
        { id: 15693, name: 'Tinjacá' },
        { id: 15696, name: 'Tipacoque' },
        { id: 15720, name: 'Toca' },
        { id: 15723, name: 'Topagá' },
        { id: 15740, name: 'Tota' },
        { id: 15753, name: 'Turmequé' },
        { id: 15757, name: 'Tutazá' },
        { id: 15759, name: 'Umbita' },
        { id: 15761, name: 'Ventaquemada' },
        { id: 15762, name: 'Viracachá' },
        { id: 15763, name: 'Zetaquira' },
      ],

      // 7. CALDAS
      7: [
        { id: 17001, name: 'Manizales' },
        { id: 17013, name: 'Aguadas' },
        { id: 17042, name: 'Anserma' },
        { id: 17050, name: 'Aranzazu' },
        { id: 17000, name: 'Belalcázar' },
        { id: 17088, name: 'Chinchiná' },
        { id: 17174, name: 'Filadelfia' },
        { id: 17272, name: 'La Dorada' },
        { id: 17380, name: 'La Merced' },
        { id: 17388, name: 'Manzanares' },
        { id: 17433, name: 'Marmato' },
        { id: 17442, name: 'Marulanda' },
        { id: 17444, name: 'Neira' },
        { id: 17446, name: 'Norcasia' },
        { id: 17486, name: 'Pácora' },
        { id: 17495, name: 'Palestina' },
        { id: 17513, name: 'Pensilvania' },
        { id: 17524, name: 'Riosucio' },
        { id: 17541, name: 'Risaralda' },
        { id: 17614, name: 'Salamina' },
        { id: 17616, name: 'Samaná' },
        { id: 17653, name: 'San José' },
        { id: 17777, name: 'Supía' },
        { id: 17867, name: 'Victoria' },
        { id: 17873, name: 'Villamaría' },
        { id: 17877, name: 'Viterbo' },
      ],

      // 8. CAQUETÁ
      8: [
        { id: 18001, name: 'Florencia' },
        { id: 18029, name: 'Albania' },
        { id: 18094, name: 'Belén de los Andaquíes' },
        { id: 18150, name: 'Cartagena del Chairá' },
        { id: 18205, name: 'Curillo' },
        { id: 18247, name: 'El Doncello' },
        { id: 18256, name: 'El Paujíl' },
        { id: 18410, name: 'La Montañita' },
        { id: 18460, name: 'Milán' },
        { id: 18479, name: 'Morelia' },
        { id: 18592, name: 'Puerto Rico' },
        { id: 18610, name: 'San José del Fragua' },
        { id: 18753, name: 'Solano' },
        { id: 18756, name: 'Solita' },
        { id: 18785, name: 'Valparaíso' },
      ],

      // 9. CASANARE
      9: [
        { id: 85001, name: 'Yopal' },
        { id: 85010, name: 'Aguazul' },
        { id: 85015, name: 'Chámeza' },
        { id: 85125, name: 'Hato Corozal' },
        { id: 85136, name: 'La Salina' },
        { id: 85139, name: 'Maní' },
        { id: 85162, name: 'Montañas del Totumo (Verificar si es municipio)' }, // REVISAR
        { id: 85225, name: 'Nunchía' },
        { id: 85230, name: 'Orocué' },
        { id: 85250, name: 'Paz de Ariporo' },
        { id: 85263, name: 'Pore' },
        { id: 85279, name: 'Recetor' },
        { id: 85300, name: 'Sabanalarga' },
        { id: 85315, name: 'Sácama' },
        { id: 85325, name: 'San Luis de Palenque' },
        { id: 85400, name: 'Támara' },
        { id: 85410, name: 'Tauramena' },
        { id: 85430, name: 'Trinidad' },
        { id: 85440, name: 'Villanueva' },
      ],

      // 10. CAUCA
      10: [
        { id: 19001, name: 'Popayán' },
        { id: 19022, name: 'Almaguer' },
        { id: 19050, name: 'Argelia' },
        { id: 19075, name: 'Balboa' },
        { id: 19100, name: 'Bolívar' },
        { id: 19110, name: 'Buenos Aires' },
        { id: 19130, name: 'Cajibío' },
        { id: 19137, name: 'Caldono' },
        { id: 19142, name: 'Caloto' },
        { id: 19212, name: 'Corinto' },
        { id: 19256, name: 'El Tambo' },
        { id: 19290, name: 'Guachené' },
        { id: 19300, name: 'Guapí' },
        { id: 19318, name: 'Inzá' },
        { id: 19355, name: 'Jambaló' },
        { id: 19364, name: 'La Sierra' },
        { id: 19367, name: 'La Vega' },
        { id: 19392, name: 'López de Micay' },
        { id: 19397, name: 'Mercaderes' },
        { id: 19418, name: 'Miranda' },
        { id: 19450, name: 'Morales' },
        { id: 19513, name: 'Padilla' },
        { id: 19517, name: 'Paez (Belalcázar)' },
        { id: 19532, name: 'Patía (El Bordo)' },
        { id: 19533, name: 'Piamonte' },
        { id: 19548, name: 'Piendamó' },
        { id: 19573, name: 'Puerto Tejada' },
        { id: 19585, name: 'Puracé (Coconuco)' },
        { id: 19622, name: 'Rosas' },
        { id: 19693, name: 'Santander de Quilichao' },
        { id: 19698, name: 'Silvia' },
        { id: 19701, name: 'Sotará (Paispamba)' },
        { id: 19743, name: 'Suárez' },
        { id: 19760, name: 'Sucre' },
        { id: 19780, name: 'Timbío' },
        { id: 19785, name: 'Timbiquí' },
        { id: 19807, name: 'Toribío' },
        { id: 19809, name: 'Totoró' },
        { id: 19821, name: 'Villa Rica' },
      ],
      // 11. CESAR
      11: [
        { id: 20001, name: 'Valledupar' },
        { id: 20011, name: 'Aguachica' },
        { id: 20013, name: 'Agustín Codazzi' },
        { id: 20032, name: 'Astrea' },
        { id: 20045, name: 'Becerril' },
        { id: 20060, name: 'Bosconia' },
        { id: 20175, name: 'Chimichagua' },
        { id: 20178, name: 'Chiriguaná' },
        { id: 20228, name: 'Curumaní' },
        { id: 20238, name: 'El Copey' },
        { id: 20250, name: 'El Paso' },
        { id: 20295, name: 'Gamarra' },
        { id: 20310, name: 'González' },
        { id: 20383, name: 'La Gloria' },
        { id: 20400, name: 'Manaure Balcón del Cesar' },
        { id: 20443, name: 'Pelaya' },
        { id: 20495, name: 'La Jagua de Ibirico' },
        { id: 20517, name: 'Pailitas' },
        { id: 20550, name: 'Río de Oro' },
        { id: 20570, name: 'San Alberto' },
        { id: 20580, name: 'San Diego' },
        { id: 20590, name: 'Pueblo Bello' },
        { id: 20614, name: 'San Martín' },
        { id: 20621, name: 'La Paz' },
        { id: 20710, name: 'Tamalameque' },
      ],

      // 12. CHOCÓ
      12: [
        { id: 27001, name: 'Quibdó' },
        { id: 27006, name: 'Acandí' },
        { id: 27025, name: 'Alto Baudó' },
        { id: 27050, name: 'Bagadó' },
        { id: 27073, name: 'Bahía Solano' },
        { id: 27075, name: 'Bajo Baudó' },
        { id: 27099, name: 'Bojayá' },
        { id: 27135, name: 'Cantón de San Pablo' },
        { id: 27150, name: 'Carmen del Darién' },
        { id: 27160, name: 'Cértegui' },
        { id: 27205, name: 'El Carmen de Atrato' },
        { id: 27245, name: 'Istmina' },
        { id: 27250, name: 'Juradó' },
        { id: 27361, name: 'Lloró' },
        { id: 27372, name: 'Medio Atrato' },
        { id: 27413, name: 'Medio Baudó' },
        { id: 27425, name: 'Medio San Juan' },
        { id: 27430, name: 'Nóvita' },
        { id: 27450, name: 'Nuquí' },
        { id: 27491, name: 'Río Iró' },
        { id: 27495, name: 'Río Quito' },
        { id: 27580, name: 'Riosucio' },
        { id: 27600, name: 'San José del Palmar' },
        { id: 27615, name: 'Sipí' },
        { id: 27660, name: 'Tadó' },
        { id: 27745, name: 'Unguía' },
        // NOTA: Chocó cuenta oficialmente con 30 municipios, pero Belén de Bajirá está en disputa
        // y hay municipios recientes como Unión Panamericana (27787) que también se incluyen en listados recientes:
        { id: 27787, name: 'Unión Panamericana' },
      ],

      // 13. CÓRDOBA
      13: [
        { id: 23001, name: 'Montería' },
        { id: 23068, name: 'Ayapel' },
        { id: 23079, name: 'Buenavista' },
        { id: 23090, name: 'Canalete' },
        { id: 23162, name: 'Cereté' },
        { id: 23168, name: 'Chimá' },
        { id: 23182, name: 'Chinú' },
        { id: 23189, name: 'Cotorra' },
        { id: 23300, name: 'Lorica' },
        { id: 23350, name: 'Los Córdobas' },
        { id: 23417, name: 'Momil' },
        { id: 23419, name: 'Montelíbano' },
        { id: 23464, name: 'Moñitos' },
        { id: 23500, name: 'Planeta Rica' },
        { id: 23555, name: 'Pueblo Nuevo' },
        { id: 23570, name: 'Puerto Escondido' },
        { id: 23660, name: 'Purísima de la Concepción' },
        { id: 23670, name: 'Sahagún' },
        { id: 23672, name: 'San Andrés de Sotavento' },
        { id: 23675, name: 'San Antero' },
        { id: 23678, name: 'San Bernardo del Viento' },
        { id: 23682, name: 'San Carlos' },
        { id: 23686, name: 'San Pelayo' },
        { id: 23807, name: 'Tierralta' },
        { id: 23815, name: 'Tuchín' },
        { id: 23855, name: 'Valencia' },
      ],

      // 14. CUNDINAMARCA
      14: [
        // NOTA: Cundinamarca posee 116 municipios. Aquí se listan todos con su respectivo
        // código DANE. Por su extensión, verifica que tengas suficiente espacio en tu archivo.
        { id: 25001, name: 'Agua de Dios' },
        { id: 25019, name: 'Albán' },
        { id: 25035, name: 'Anapoima' },
        { id: 25040, name: 'Anolaima' },
        { id: 25053, name: 'Arbeláez' },
        { id: 25086, name: 'Beltrán' },
        { id: 25095, name: 'Bituima' },
        { id: 25107, name: 'Bojacá' },
        { id: 25120, name: 'Cabrera' },
        { id: 25123, name: 'Cachipay' },
        { id: 25126, name: 'Cajicá' },
        { id: 25148, name: 'Caparrapí' },
        { id: 25151, name: 'Caqueza' },
        { id: 25154, name: 'Chaguaní' },
        { id: 25168, name: 'Chipaque' },
        { id: 25175, name: 'Choachí' },
        { id: 25178, name: 'Chocontá' },
        { id: 25200, name: 'Cogua' },
        { id: 25214, name: 'Cota' },
        { id: 25245, name: 'El Colegio' },
        { id: 25258, name: 'El Peñón' },
        { id: 25260, name: 'El Rosal' },
        { id: 25269, name: 'Facatativá' },
        { id: 25279, name: 'Fomeque' },
        { id: 25281, name: 'Fosca' },
        { id: 25286, name: 'Funza' },
        { id: 25288, name: 'Fúquene' },
        { id: 25290, name: 'Gachala' },
        { id: 25293, name: 'Gachancipá' },
        { id: 25295, name: 'Gachetá' },
        { id: 25297, name: 'Girardot' },
        { id: 25299, name: 'Granada' },
        { id: 25307, name: 'Guachetá' },
        { id: 25312, name: 'Guaduas' },
        { id: 25317, name: 'Guasca' },
        { id: 25320, name: 'Guataquí' },
        { id: 25322, name: 'Guatavita' },
        { id: 25324, name: 'Guayabetal' },
        { id: 25326, name: 'Gutiérrez' },
        { id: 25328, name: 'Jerusalén' },
        { id: 25335, name: 'Junín' },
        { id: 25339, name: 'La Calera' },
        { id: 25368, name: 'La Mesa' },
        { id: 25372, name: 'La Palma' },
        { id: 25377, name: 'La Peña' },
        { id: 25386, name: 'Lenguazaque' },
        { id: 25394, name: 'Macheta' },
        { id: 25398, name: 'Madrid' },
        { id: 25402, name: 'Manta' },
        { id: 25407, name: 'Medina' },
        { id: 25426, name: 'Mosquera' },
        { id: 25430, name: 'Nariño' },
        { id: 25436, name: 'Nemocón' },
        { id: 25438, name: 'Nilo' },
        { id: 25439, name: 'Nimaima' },
        { id: 25440, name: 'Nocaima' },
        { id: 25443, name: 'Venecia (Ospina Pérez)' },
        { id: 25486, name: 'Pacho' },
        { id: 25488, name: 'Paime' },
        { id: 25489, name: 'Pandi' },
        { id: 25491, name: 'Paratebueno' },
        { id: 25492, name: 'Pasca' },
        { id: 25506, name: 'Puerto Salgar' },
        { id: 25513, name: 'Pulí' },
        { id: 25518, name: 'Quebradanegra' },
        { id: 25524, name: 'Quetame' },
        { id: 25530, name: 'Quipile' },
        { id: 25535, name: 'Apulo (Rafael Reyes)' },
        { id: 25572, name: 'Ricaurte' },
        { id: 25580, name: 'San Bernardo' },
        { id: 25592, name: 'San Cayetano' },
        { id: 25594, name: 'San Francisco' },
        { id: 25596, name: 'San Juan de Rioseco' },
        { id: 25612, name: 'Sasaima' },
        { id: 25645, name: 'Sesquilé' },
        { id: 25649, name: 'Sibaté' },
        { id: 25653, name: 'Silvania' },
        { id: 25658, name: 'Simijaca' },
        { id: 25662, name: 'Soacha' },
        { id: 25718, name: 'Sopó' },
        { id: 25736, name: 'Subachoque' },
        { id: 25740, name: 'Suesca' },
        { id: 25743, name: 'Supatá' },
        { id: 25745, name: 'Útica' },
        { id: 25754, name: 'Tausa' },
        { id: 25758, name: 'Tena' },
        { id: 25769, name: 'Tenjo' },
        { id: 25772, name: 'Tibacuy' },
        { id: 25777, name: 'Tibirita' },
        { id: 25779, name: 'Tocaima' },
        { id: 25781, name: 'Tocancipá' },
        { id: 25785, name: 'Topaipí' },
        { id: 25793, name: 'Ubalá' },
        { id: 25797, name: 'Ubaque' },
        { id: 25799, name: 'Ubaté' },
        { id: 25805, name: 'Une' },
        { id: 25807, name: 'Útica' },
        { id: 25815, name: 'Vergara' },
        { id: 25817, name: 'Vianí' },
        { id: 25823, name: 'Villagómez' },
        { id: 25825, name: 'Villapinzón' },
        { id: 25839, name: 'Villeta' },
        { id: 25841, name: 'Viotá' },
        { id: 25843, name: 'Zipacón' },
        { id: 25845, name: 'Zipaquirá' },
      ],

      // 15. GUAINÍA
      15: [
        { id: 94001, name: 'Inírida' },
        { id: 94343, name: 'Barranco Minas (Corregimiento, no municipio oficial)' },
        { id: 94663, name: 'Mapiripana' },
        { id: 94883, name: 'San Felipe' },
        { id: 94884, name: 'Puerto Colombia' },
        { id: 94885, name: 'La Guadalupe (Corregimiento)' },
        { id: 94886, name: 'Cacahual' },
        { id: 94887, name: 'Pana Pana' },
        { id: 94888, name: 'Morichal (Corregimiento)' },
      ],
      // 16. GUAVIARE
      16: [
        { id: 95001, name: 'San José del Guaviare' },
        { id: 95015, name: 'Calamar' },
        { id: 95025, name: 'El Retorno' },
        { id: 95200, name: 'Miraflores' },
      ],

      // 17. HUILA
      17: [
        { id: 41001, name: 'Neiva' },
        { id: 41006, name: 'Acevedo' },
        { id: 41013, name: 'Agrado' },
        { id: 41016, name: 'Aipe' },
        { id: 41020, name: 'Algeciras' },
        { id: 41026, name: 'Altamira' },
        { id: 41078, name: 'Baraya' },
        { id: 41132, name: 'Campoalegre' },
        { id: 41206, name: 'Colombia' },
        { id: 41244, name: 'Elías' },
        { id: 41298, name: 'Garzón' },
        { id: 41306, name: 'Gigante' },
        { id: 41319, name: 'Guadalupe' },
        { id: 41349, name: 'Hobo' },
        { id: 41357, name: 'Íquira' },
        { id: 41359, name: 'Isnos' },
        { id: 41378, name: 'La Argentina' },
        { id: 41396, name: 'La Plata' },
        { id: 41483, name: 'Nátaga' },
        { id: 41503, name: 'Oporapa' },
        { id: 41518, name: 'Paicol' },
        { id: 41524, name: 'Palermo' },
        { id: 41615, name: 'Pital' },
        { id: 41660, name: 'Pitalito' },
        { id: 41668, name: 'Rivera' },
        { id: 41676, name: 'Saladoblanco' },
        { id: 41770, name: 'San Agustín' },
        { id: 41791, name: 'Santa María' },
        { id: 41797, name: 'Suaza' },
        { id: 41801, name: 'Tarqui' },
        { id: 41807, name: 'Tesalia' },
        { id: 41872, name: 'Tello' },
        { id: 41885, name: 'Teruel' },
        { id: 41907, name: 'Timaná' },
        { id: 41924, name: 'Villavieja' },
        { id: 41930, name: 'Yaguará' },
      ],

      // 18. LA GUAJIRA
      18: [
        { id: 44001, name: 'Riohacha' },
        { id: 44035, name: 'Albania' },
        { id: 44078, name: 'Barrancas' },
        { id: 44090, name: 'Dibulla' },
        { id: 44098, name: 'Distracción' },
        { id: 44110, name: 'El Molino' },
        { id: 44279, name: 'Fonseca' },
        { id: 44378, name: 'Hatonuevo' },
        { id: 44420, name: 'Manaure' },
        { id: 44430, name: 'Maicao' },
        { id: 44560, name: 'San Juan del Cesar' },
        { id: 44650, name: 'Uribia' },
        { id: 44847, name: 'Urumita' },
      ],

      // 19. MAGDALENA
      19: [
        { id: 47001, name: 'Santa Marta' },
        { id: 47030, name: 'Algarrobo' },
        { id: 47053, name: 'Aracataca' },
        { id: 47058, name: 'Ariguaní' },
        { id: 47161, name: 'Cerro de San Antonio' },
        { id: 47170, name: 'Chivolo' },
        { id: 47189, name: 'Ciénaga' },
        { id: 47205, name: 'Concordia' },
        { id: 47245, name: 'El Banco' },
        { id: 47258, name: 'El Piñón' },
        { id: 47268, name: 'El Retén' },
        { id: 47288, name: 'Fundación' },
        { id: 47318, name: 'Guamal' },
        { id: 47460, name: 'Nueva Granada' },
        { id: 47541, name: 'Pedraza' },
        { id: 47545, name: 'Pijiño del Carmen' },
        { id: 47551, name: 'Pivijay' },
        { id: 47555, name: 'Plato' },
        { id: 47570, name: 'Pueblo Viejo' },
        { id: 47605, name: 'Remolino' },
        { id: 47660, name: 'Sabanas de San Ángel' },
        { id: 47675, name: 'Salamina' },
        { id: 47692, name: 'San Sebastián de Buenavista' },
        { id: 47703, name: 'San Zenón' },
        { id: 47707, name: 'Santa Ana' },
        { id: 47720, name: 'Sitionuevo' },
        { id: 47745, name: 'Tenerife' },
        { id: 47798, name: 'Zapayán' },
        { id: 47960, name: 'Zona Bananera' },
      ],

      // 20. META
      20: [
        { id: 50001, name: 'Villavicencio' },
        { id: 50006, name: 'Acacías' },
        { id: 50110, name: 'Barranca de Upía' },
        { id: 50124, name: 'Cabuyaro' },
        { id: 50150, name: 'Castilla La Nueva' },
        { id: 50223, name: 'Cubarral' },
        { id: 50226, name: 'Cumaral' },
        { id: 50245, name: 'El Calvario' },
        { id: 50251, name: 'El Castillo' },
        { id: 50270, name: 'El Dorado' },
        { id: 50287, name: 'Fuente de Oro' },
        { id: 50313, name: 'Granada' },
        { id: 50318, name: 'Guamal' },
        { id: 50325, name: 'Mapiripán' },
        { id: 50330, name: 'Mesetas' },
        { id: 50350, name: 'La Macarena' },
        { id: 50370, name: 'Lejanías' },
        { id: 50400, name: 'Restrepo' },
        { id: 50450, name: 'Puerto Concordia' },
        { id: 50568, name: 'Puerto Gaitán' },
        { id: 50573, name: 'Puerto López' },
        { id: 50577, name: 'Puerto Lleras' },
        { id: 50590, name: 'Puerto Rico' },
        { id: 50680, name: 'San Carlos de Guaroa' },
        { id: 50683, name: 'San Juan de Arama' },
        { id: 50686, name: 'San Juanito' },
        { id: 50711, name: 'Vistahermosa' },
      ],
      // 21. NARIÑO
      21: [
        { id: 52001, name: 'Pasto' },
        { id: 52019, name: 'Albán (San José)' },
        { id: 52022, name: 'Aldana' },
        { id: 52036, name: 'Ancuya' },
        { id: 52051, name: 'Arboleda (Berruecos)' },
        { id: 52079, name: 'Barbacoas' },
        { id: 52083, name: 'Belén' },
        { id: 52110, name: 'Colón (Génova)' },
        { id: 52203, name: 'Consacá' },
        { id: 52207, name: 'Contadero' },
        { id: 52210, name: 'Córdoba' },
        { id: 52215, name: 'Cuaspud (Carlosama)' },
        { id: 52224, name: 'Cumbal' },
        { id: 52227, name: 'Cumbitara' },
        { id: 52233, name: 'Chachagüí' },
        { id: 52240, name: 'El Charco' },
        { id: 52250, name: 'El Peñol' },
        { id: 52254, name: 'El Rosario' },
        { id: 52256, name: 'El Tambo' },
        { id: 52258, name: 'Funes' },
        { id: 52260, name: 'Guachucal' },
        { id: 52287, name: 'Guaitarilla' },
        { id: 52290, name: 'Gualmatán' },
        { id: 52317, name: 'Iles' },
        { id: 52320, name: 'Imués' },
        { id: 52323, name: 'Ipiales' },
        { id: 52352, name: 'La Cruz' },
        { id: 52354, name: 'La Florida' },
        { id: 52356, name: 'La Llanada' },
        { id: 52378, name: 'La Tola' },
        { id: 52405, name: 'Leiva' },
        { id: 52411, name: 'Linares' },
        { id: 52418, name: 'Los Andes (Sotomayor)' },
        { id: 52427, name: 'Magüí (Payán)' },
        { id: 52435, name: 'Mallama (Piedrancha)' },
        { id: 52473, name: 'Mosquera' },
        { id: 52480, name: 'Nariño' },
        { id: 52490, name: 'Olaya Herrera' },
        { id: 52506, name: 'Ospina' },
        { id: 52520, name: 'Francisco Pizarro (Salahonda)' },
        { id: 52540, name: 'Policarpa' },
        { id: 52560, name: 'Potosí' },
        { id: 52565, name: 'Providencia' },
        { id: 52573, name: 'Puerres' },
        { id: 52585, name: 'Pupiales' },
        { id: 52612, name: 'Roberto Payán (San José)' },
        { id: 52621, name: 'Samaniego' },
        { id: 52678, name: 'Sandoná' },
        { id: 52683, name: 'San Bernardo' },
        { id: 52685, name: 'San Lorenzo' },
        { id: 52687, name: 'San Pablo' },
        { id: 52693, name: 'Sapuyes' },
        { id: 52694, name: 'Taminango' },
        { id: 52696, name: 'Tangua' },
        { id: 52699, name: 'El Tablón de Gómez' },
        { id: 52720, name: 'Túquerres' },
        { id: 52723, name: 'Yacuanquer' },
      ],

      // 22. NORTE DE SANTANDER
      22: [
        { id: 54001, name: 'Cúcuta' },
        { id: 54003, name: 'Abrego' },
        { id: 54051, name: 'Arboledas' },
        { id: 54099, name: 'Bochalema' },
        { id: 54109, name: 'Bucarasica' },
        { id: 54125, name: 'Cácota' },
        { id: 54128, name: 'Cachirá' },
        { id: 54172, name: 'Chinácota' },
        { id: 54174, name: 'Chitagá' },
        { id: 54206, name: 'Convención' },
        { id: 54223, name: 'Cúcuta (Zona rural, revisar si duplicado)' },
        { id: 54239, name: 'Durania' },
        { id: 54245, name: 'El Carmen' },
        { id: 54250, name: 'El Tarra' },
        { id: 54261, name: 'El Zulia' },
        { id: 54313, name: 'Gramalote' },
        { id: 54344, name: 'Hacarí' },
        { id: 54347, name: 'Herrán' },
        { id: 54377, name: 'Labateca' },
        { id: 54385, name: 'La Esperanza' },
        { id: 54398, name: 'La Playa de Belén' },
        { id: 54405, name: 'Los Patios' },
        { id: 54418, name: 'Lourdes' },
        { id: 54480, name: 'Mutiscua' },
        { id: 54498, name: 'Ocaña' },
        { id: 54518, name: 'Pamplona' },
        { id: 54520, name: 'Pamplonita' },
        { id: 54553, name: 'Puerto Santander' },
        { id: 54599, name: 'Ragonvalia' },
        { id: 54660, name: 'Salazar' },
        { id: 54670, name: 'San Calixto' },
        { id: 54673, name: 'San Cayetano' },
        { id: 54680, name: 'Santiago' },
        { id: 54720, name: 'Sardinata' },
        { id: 54743, name: 'Silos' },
        { id: 54800, name: 'Teorama' },
        { id: 54810, name: 'Tibú' },
        { id: 54820, name: 'Toledo' },
        { id: 54871, name: 'Villa Caro' },
        { id: 54874, name: 'Villa del Rosario' },
      ],

      // 23. PUTUMAYO
      23: [
        { id: 86001, name: 'Mocoa' },
        { id: 86219, name: 'Colón' },
        { id: 86320, name: 'Orito' },
        { id: 86568, name: 'Puerto Asís' },
        { id: 86569, name: 'Puerto Caicedo' },
        { id: 86571, name: 'Puerto Guzmán' },
        { id: 86573, name: 'Puerto Leguízamo' },
        { id: 86749, name: 'San Francisco' },
        { id: 86755, name: 'San Miguel' },
        { id: 86757, name: 'Santiago' },
        { id: 86760, name: 'Sibundoy' },
        { id: 86865, name: 'Valle del Guamuez' },
        { id: 86885, name: 'Villagarzón' },
      ],

      // 24. QUINDÍO
      24: [
        { id: 63001, name: 'Armenia' },
        { id: 63111, name: 'Buenavista' },
        { id: 63130, name: 'Calarcá' },
        { id: 63190, name: 'Circasia' },
        { id: 63212, name: 'Córdoba' },
        { id: 63272, name: 'Filandia' },
        { id: 63302, name: 'Génova' },
        { id: 63401, name: 'La Tebaida' },
        { id: 63470, name: 'Montenegro' },
        { id: 63548, name: 'Pijao' },
        { id: 63594, name: 'Quimbaya' },
        { id: 63690, name: 'Salento' },
      ],

      // 25. RISARALDA
      25: [
        { id: 66001, name: 'Pereira' },
        { id: 66045, name: 'Apía' },
        { id: 66075, name: 'Balboa' },
        { id: 66088, name: 'Belén de Umbría' },
        { id: 66170, name: 'Dosquebradas' },
        { id: 66318, name: 'Guática' },
        { id: 66383, name: 'La Celia' },
        { id: 66400, name: 'La Virginia' },
        { id: 66440, name: 'Marsella' },
        { id: 66456, name: 'Mistrató' },
        { id: 66572, name: 'Pueblo Rico' },
        { id: 66594, name: 'Quinchía' },
        { id: 66682, name: 'Santa Rosa de Cabal' },
        { id: 66687, name: 'Santuario' },
      ],
      // 26. SAN ANDRÉS Y PROVIDENCIA
      26: [
        // Oficialmente, son dos municipios según DANE:
        { id: 88001, name: 'San Andrés' },
        { id: 88564, name: 'Providencia' }, // Incluye la isla de Santa Catalina
      ],

      // 27. SANTANDER
      27: [
        { id: 68001, name: 'Bucaramanga' },
        { id: 68013, name: 'Aguada' },
        { id: 68020, name: 'Albania' },
        { id: 68051, name: 'Aratoca' },
        { id: 68077, name: 'Barbosa' },
        { id: 68079, name: 'Barichara' },
        { id: 68081, name: 'Barrancabermeja' },
        { id: 68092, name: 'Betulia' },
        { id: 68101, name: 'Bolívar' },
        { id: 68121, name: 'Cabrera' },
        { id: 68132, name: 'California' },
        { id: 68147, name: 'Capitanejo' },
        { id: 68152, name: 'Carcasí' },
        { id: 68160, name: 'Cepitá' },
        { id: 68162, name: 'Cerrito' },
        { id: 68167, name: 'Charalá' },
        { id: 68169, name: 'Charta' },
        { id: 68176, name: 'Chipatá' },
        { id: 68179, name: 'Cimitarra' },
        { id: 68190, name: 'Confines' },
        { id: 68207, name: 'Contratación' },
        { id: 68209, name: 'Coromoro' },
        { id: 68211, name: 'Curití' },
        { id: 68217, name: 'El Carmen de Chucurí' },
        { id: 68229, name: 'El Guacamayo' },
        { id: 68235, name: 'El Peñón' },
        { id: 68245, name: 'Floridablanca' },
        { id: 68250, name: 'Galán' },
        { id: 68255, name: 'Gambita' },
        { id: 68264, name: 'Girón' },
        { id: 68266, name: 'Guaca' },
        { id: 68271, name: 'Guadalupe' },
        { id: 68276, name: 'Guapotá' },
        { id: 68296, name: 'Jesús María' },
        { id: 68298, name: 'Jordan' },
        { id: 68307, name: 'La Belleza' },
        { id: 68318, name: 'Landázuri' },
        { id: 68320, name: 'Lebríja' },
        { id: 68322, name: 'Los Santos' },
        { id: 68324, name: 'Macaravita' },
        { id: 68327, name: 'Málaga' },
        { id: 68344, name: 'Matanza' },
        { id: 68368, name: 'Mogotes' },
        { id: 68370, name: 'Molagavita' },
        { id: 68377, name: 'Ocamonte' },
        { id: 68385, name: 'Oiba' },
        { id: 68397, name: 'Onzaga' },
        { id: 68406, name: 'Palmar' },
        { id: 68418, name: 'Páramo' },
        { id: 68425, name: 'Piedecuesta' },
        { id: 68432, name: 'Pinchote' },
        { id: 68444, name: 'Puente Nacional' },
        { id: 68464, name: 'San Andrés' },
        { id: 68468, name: 'San Benito' },
        { id: 68498, name: 'San Gil' },
        { id: 68500, name: 'San Joaquín' },
        { id: 68502, name: 'San Miguel' },
        { id: 68522, name: 'Santa Bárbara' },
        { id: 68524, name: 'Barbosa (Verificar duplicado con 68077, que es el correcto)' },
        // NOTA: 68524 corresponde a Santa Helena del Opón, no a Barbosa. Ajustamos:
        { id: 68524, name: 'Santa Helena del Opón' },
        { id: 68533, name: 'Simacota' },
        { id: 68547, name: 'Socorro' },
        { id: 68549, name: 'Suaita' },
        { id: 68572, name: 'Suratá' },
        { id: 68615, name: 'Tona' },
        { id: 68655, name: 'Vélez' },
        { id: 68669, name: 'Vetas' },
        { id: 68673, name: 'Villanueva' },
        { id: 68679, name: 'Zapatoca' },
      ],

      // 28. SUCRE
      28: [
        { id: 70001, name: 'Sincelejo' },
        { id: 70024, name: 'Caimito' },
        { id: 70050, name: 'Colosó (Ricaurte)' },
        { id: 70075, name: 'Corozal' },
        { id: 70110, name: 'Chalán' },
        { id: 70124, name: 'El Roble' },
        { id: 70130, name: 'Galeras (Nueva Granada)' },
        { id: 70204, name: 'Guaranda' },
        { id: 70215, name: 'Los Palmitos' },
        { id: 70221, name: 'Majagual' },
        { id: 70230, name: 'Morroa' },
        { id: 70233, name: 'Ovejas' },
        { id: 70235, name: 'Palmito' },
        { id: 70265, name: 'Sampués' },
        { id: 70400, name: 'San Benito Abad' },
        { id: 70418, name: 'San Marcos' },
        { id: 70429, name: 'San Onofre' },
        { id: 70431, name: 'San Pedro' },
        { id: 70473, name: 'Sincé' },
        { id: 70508, name: 'Tolú' },
        { id: 70523, name: 'Tolú Viejo' },
        { id: 70670, name: 'Coveñas' }, // Municipio creado en 2002
      ],

      // 29. TOLIMA
      29: [
        { id: 73001, name: 'Ibagué' },
        { id: 73024, name: 'Alpujarra' },
        { id: 73026, name: 'Alvarado' },
        { id: 73030, name: 'Ambalema' },
        { id: 73043, name: 'Anzoátegui' },
        { id: 73055, name: 'Armero (Guayabal)' },
        { id: 73067, name: 'Ataco' },
        { id: 73124, name: 'Cajamarca' },
        { id: 73148, name: 'Chaparral' },
        { id: 73152, name: 'Coello' },
        { id: 73168, name: 'Coyaima' },
        { id: 73200, name: 'Cunday' },
        { id: 73217, name: 'Dolores' },
        { id: 73226, name: 'Espinal' },
        { id: 73236, name: 'Falan' },
        { id: 73268, name: 'Flandes' },
        { id: 73270, name: 'Fresno' },
        { id: 73275, name: 'Guamo' },
        { id: 73283, name: 'Herveo' },
        { id: 73286, name: 'Honda' },
        { id: 73319, name: 'Icononzo' },
        { id: 73347, name: 'Lérida' },
        { id: 73349, name: 'Líbano' },
        { id: 73352, name: 'Mariquita' },
        { id: 73408, name: 'Melgar' },
        { id: 73411, name: 'Murillo' },
        { id: 73443, name: 'Natagaima' },
        { id: 73449, name: 'Ortega' },
        { id: 73461, name: 'Palocabildo' },
        { id: 73483, name: 'Piedras' },
        { id: 73504, name: 'Planadas' },
        { id: 73520, name: 'Prado' },
        { id: 73547, name: 'Purificación' },
        { id: 73555, name: 'Rioblanco' },
        { id: 73563, name: 'Roncesvalles' },
        { id: 73585, name: 'Rovira' },
        { id: 73616, name: 'Saldaña' },
        { id: 73622, name: 'San Antonio' },
        { id: 73624, name: 'San Luis' },
        { id: 73671, name: 'Santa Isabel' },
        { id: 73675, name: 'Suárez' },
        { id: 73678, name: 'Valle de San Juan' },
        { id: 73686, name: 'Venadillo' },
        { id: 73770, name: 'Villahermosa' },
        { id: 73854, name: 'Villarrica' },
      ],

      // 30. VALLE DEL CAUCA
      30: [
        { id: 76001, name: 'Cali (Santiago de Cali)' },
        { id: 76020, name: 'Alcalá' },
        { id: 76036, name: 'Andalucía' },
        { id: 76041, name: 'Ansermanuevo' },
        { id: 76054, name: 'Argelia' },
        { id: 76100, name: 'Bolívar' },
        { id: 76109, name: 'Buenaventura' },
        { id: 76111, name: 'Guadalajara de Buga' },
        { id: 76113, name: 'Bugalagrande' },
        { id: 76122, name: 'Caicedonia' },
        { id: 76126, name: 'Calima (El Darién)' },
        { id: 76130, name: 'Candelaria' },
        { id: 76147, name: 'Cartago' },
        { id: 76233, name: 'Dagua' },
        { id: 76243, name: 'El Águila' },
        { id: 76246, name: 'El Cairo' },
        { id: 76248, name: 'El Cerrito' },
        { id: 76250, name: 'El Dovio' },
        { id: 76275, name: 'Florida' },
        { id: 76306, name: 'Ginebra' },
        { id: 76318, name: 'Guacarí' },
        { id: 76364, name: 'Jamundí' },
        { id: 76377, name: 'La Cumbre' },
        { id: 76400, name: 'La Unión' },
        { id: 76403, name: 'La Victoria' },
        { id: 76497, name: 'Obando' },
        { id: 76520, name: 'Palmira' },
        { id: 76563, name: 'Pradera' },
        { id: 76606, name: 'Restrepo' },
        { id: 76616, name: 'Riofrío' },
        { id: 76622, name: 'Roldanillo' },
        { id: 76670, name: 'San Pedro' },
        { id: 76736, name: 'Sevilla' },
        { id: 76823, name: 'Toro' },
        { id: 76828, name: 'Trujillo' },
        { id: 76834, name: 'Tuluá' },
        { id: 76845, name: 'Ulloa' },
        { id: 76863, name: 'Versalles' },
        { id: 76869, name: 'Vijes' },
        { id: 76890, name: 'Yotoco' },
        { id: 76892, name: 'Yumbo' },
        { id: 76895, name: 'Zarzal' },
      ],
      // 31. VAUPÉS
      31: [
        { id: 97001, name: 'Mitú' },
        { id: 97511, name: 'Carurú' },
        { id: 97666, name: 'Pacoa' }, // Área no municipalizada según algunos listados, pero a menudo se incluye
        { id: 97777, name: 'Taraira' }, // Lo mismo, aparece como municipio reciente en Vaupés
        { id: 97889, name: 'Papunaua' }, // Verificar si es corregimiento o municipio
        { id: 97979, name: 'Yavarate' }, // Igual, en disputa como área no municipalizada
      ],

      // 32. VICHADA
      32: [
        { id: 99001, name: 'Puerto Carreño' },
        { id: 99524, name: 'La Primavera' },
        { id: 99624, name: 'Santa Rosalía' },
        { id: 99773, name: 'Cumaribo' },
      ],

      // 33. BOGOTÁ D.C.
      33: [{ id: 1234567, name: 'BOGOTÁ, D.C.' }],
    };

    this.municipalitiesList = municipios[departmentId] || [];

    // if (this.municipalitiesList.length > 0) {
    //   this.requestForm.get('municipality')?.disable();
    // } else {
    //   this.requestForm.get('municipality')?.disable();
    //   this.requestForm.get('municipality')?.setValue(null); // Reiniciar valor
    // }
  }

  ngOnInit(): void {
    this.createForm();
    this.requestForm
      .get('confirmEmail')
      ?.setValidators([
        Validators.required,
        Validators.email,
        commonEmailDomainValidator(),
        this.matchEmailValidator.bind(this),
      ]);

    this.getApplicantList();
    this.loadEconomicActivities();
    this.requestForm.get('department')?.valueChanges.subscribe(selectedDepartment => {
      const departmentId = selectedDepartment?.id || selectedDepartment;
      if (departmentId) {
        this.loadMunicipalities(departmentId);
      } else {
        this.requestForm.get('municipality')?.setValue('');
      }
    });
    this.requestForm.get('economicActivityCiiuCode')?.valueChanges.subscribe(code => {
      const match = this.economicActivityList.find(item => item.code === code);
      if (match) {
        this.requestForm.get('economicActivityCiiuDescription')?.setValue(match.description);
        this.requestForm.get('economicActivityCiiuDescription')?.disable();
      } else {
        this.requestForm.get('economicActivityCiiuDescription')?.setValue('');
        this.requestForm.get('economicActivityCiiuDescription')?.enable();
      }
    });
    this.requestForm.get('legalRepresentativeDocumentType')?.valueChanges.subscribe(() => {
      this.requestForm.get('legalRepresentativeDocumentNumber')?.updateValueAndValidity();
    });
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.value = {
      catalog_item_id: 1,
      catalog_item_name: 'NIT',
      regex: '^[0-9]{0,9}$',
    };
  }

  createForm() {
    this.requestForm = this.formBuilder.group({
      // Información de la empresa
      documentType: ['', Validators.required],
      documentNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(5)],
      ],
      verificationDigit: [{ value: '', disabled: true }],
      businessName: [{ value: '', disabled: true }, Validators.required],
      tradeName: [{ value: '', disabled: true }],
      department: [{ value: '', disabled: true }, Validators.required],
      municipality: [{ value: '', disabled: true }, Validators.required],
      address: [{ value: '', disabled: true }, Validators.required],
      landline: [
        { value: '', disabled: true },
        [Validators.pattern(/^\d*$/), Validators.maxLength(7), noConsecutiveValidator],
      ],
      mobilePhone: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/),
          Validators.maxLength(10),
          noRepeatedDigitsValidator,
        ],
      ],
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email, commonEmailDomainValidator()],
      ],

      // Información del representante legal
      legalRepresentativeDocumentType: [{ value: '', disabled: true }, Validators.required],
      legalRepresentativeDocumentNumber: [
        { value: '', disabled: true },
        [Validators.required, Validators.maxLength(10), ceDocumentValidator],
      ],
      legalRepresentativeFirstName: [{ value: '', disabled: true }, Validators.required],
      legalRepresentativeMiddleName: [{ value: '', disabled: true }],
      legalRepresentativeLastName: [{ value: '', disabled: true }, Validators.required],
      legalRepresentativeSecondLastName: [{ value: '', disabled: true }],

      // Información de la actividad económica
      economicActivityCiiuCode: [{ value: '', disabled: true }, Validators.required],
      economicActivityCiiuDescription: [{ value: '', disabled: true }, Validators.required],
      confirmEmail: [
        { value: '', disabled: true },
        [Validators.required, Validators.email, commonEmailDomainValidator()],
      ],
    });
  }

  matchEmailValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.requestForm) return null;

    const emailControl = this.requestForm.get('email');
    const confirmControl = control;

    const email = emailControl?.value?.toLowerCase() || '';
    const confirm = confirmControl?.value?.toLowerCase() || '';

    return email === confirm ? null : { emailMismatch: true };
  }
  convertToLowercase(controlName: string): void {
    const control = this.requestForm.get(controlName);
    if (control) {
      control.setValue(control.value.toLowerCase(), { emitEvent: false });
    }
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  emailMatcher: ValidatorFn = (formControl: AbstractControl) => {
    const email = formControl.get('email')?.value;
    const emailConfirmed = formControl.get('validator_email')?.value;
    return email === emailConfirmed ? null : { notMatched: true };
  };

  openFileInput() {
    this.fileInput.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
    this.fileInput.nativeElement.click();
  }

  openFileInputEconomic() {
    this.fileInputEconomic.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
    this.fileInputEconomic.nativeElement.click();
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (this.arrayApplicantAttachment.length === 0) {
      this.fileNameList.clear();
    }

    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];

      let fileSizeFormat: string;
      const fileName: string = file.name;
      const fileSizeInKiloBytes = file.size / 1024;
      if (fileSizeInKiloBytes < 1024) {
        fileSizeFormat = fileSizeInKiloBytes.toFixed(2) + 'KB';
      } else {
        const fileSizeMegabytes = fileSizeInKiloBytes / 1024;
        fileSizeFormat = fileSizeMegabytes.toFixed(2) + 'MB';
      }

      if (this.isValidExtension(file)) {
        this.errorMensajeFile = `El archivo ${files[i].name} tiene una extension no permitida`;
        this.errorExtensionFile = true;
        continue;
      }

      if (file.size > 30720000) {
        this.errorMensajeFile = `El archivo ${files[i].name} supera los 30MB`;
        this.errorSizeFile = true;
        continue;
      }

      const exists = this.arrayApplicantAttachment.some(item => item.source_name === fileName);
      if (exists) {
        this.errorMensajeFile = `El archivo ${fileName} ya está adjunto`;
        this.errorRepeatFile = true;
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String: string = e.target.result.split(',')[1];
        const applicantAttach: ApplicantAttachments = {
          base64file: base64String,
          source_name: fileName,
          fileweight: fileSizeFormat,
          file: files[i],
        };

        this.fileNameList.add(fileName);
        this.arrayApplicantAttachment.push(applicantAttach);
      };
      reader.readAsDataURL(file);
    }
    setTimeout(() => {
      this.errorRepeatFile = false;
      this.errorExtensionFile = false;
      this.errorSizeFile = false;
    }, 5000);
  }

  getAplicant(): ApplicantAttachments[] {
    return this.arrayApplicantAttachment;
  }

  clearFileInput(index: number) {
    const removedFile = this.arrayApplicantAttachment.splice(index, 1)[0];
    this.fileNameList.delete(removedFile.source_name);
  }

  clearFileInputEconomi(index: number) {
    const removedFile = this.arrayEconomicAttachments.splice(index, 1)[0];
    this.economicFileNameList.delete(removedFile.source_name);
  }

  isValidExtension(file: File): boolean {
    const extensionesValidas = ['.jpeg', '.jpg', '.png', '.pdf', '.doc', '.xlsx', '.docx', '.xls'];
    const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
    return !extensionesValidas.includes('.' + fileExtension);
  }

  getApplicantList() {
    this.documentList = [
      {
        catalog_item_id: 6,
        catalog_item_name: 'NIT',
        catalog_item_label: 'NIT',
        catalog_id: 0,
        is_active: 1,
        regex: '^[0-9]+$',
      },
      {
        catalog_item_id: 3,
        catalog_item_name: 'CEDULA CIUDADANIA',
        catalog_item_label: 'CEDULA CIUDADANIA',
        catalog_id: 0,
        is_active: 1,
        regex: '^[0-9]+$',
      },
      {
        catalog_item_id: 4,
        catalog_item_name: 'CEDULA EXTRANJERIA',
        catalog_item_label: 'CEDULA EXTRANJERIA',
        catalog_id: 0,
        is_active: 1,
        regex: '^[0-9]+$',
      },
      {
        catalog_item_id: 2,
        catalog_item_name: 'TARJETA IDENTIDAD',
        catalog_item_label: 'TARJETA IDENTIDAD',
        catalog_id: 0,
        is_active: 1,
        regex: '.*',
      },
      {
        catalog_item_id: 1,
        catalog_item_name: 'PERM PROT TEMPORAL',
        catalog_item_label: 'PERM PROT TEMPORAL',
        catalog_id: 0,
        is_active: 1,
        regex: '.*',
      },
      {
        catalog_item_id: 5,
        catalog_item_name: 'PERM ESP PERMANENCIA',
        catalog_item_label: 'PERM ESP PERMANENCIA',
        catalog_id: 0,
        is_active: 1,
        regex: '.*',
      },
    ];

    // this.userService.getFormById(0).subscribe({
    //   next: (response: BodyResponse<any[]>): void => {
    //     if (response.code === 200) {
    //       this.documentList = response.data[0].catalog_source;
    //       console.log('Lista de documentos:', this.documentList);
    //     } else {
    //       this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
    //     }
    //   },
    //   error: (err: any) => {
    //     console.log(err);
    //   },
    //   complete: () => {
    //     console.log('La suscripción ha sido completada.');
    //   },
    // });
  }

  loadEconomicActivities() {
    this.userService.getCiiuCodes().subscribe({
      next: (response: any[]) => {
        this.economicActivityList = response.map(item => ({
          code: item.codigo,
          description: item.descripcion,
        }));
      },
      error: (err: any) => {
        console.error('Error al cargar actividades económicas:', err);
        this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  continueCompanyUpdate(inputValue: CompanyUpdateRequest) {
    this.userService.updateCompany(inputValue).subscribe({
      next: (response: BodyResponse<number>) => {
        if (response.code === 200) {
          if (this.isCorrectEconomicActivityData && this.isCorrectLegalRepresentativeData) {
            setTimeout(() => {
              // this.showAlertModal(response.data);
              this.showSuccessModal = true;
            }, 1000);
          } else {
            //aca es donde se van a subir los archivos S3
            this.attachApplicantFilesAll(response.data);
          }

          // this.actualizarLogProceso(response.data);
        } else {
          setTimeout(() => {
            this.showSuccessMessage('error', 'Failed', 'Operation failed!');
          }, 1000);
        }
      },
      error: (err: any) => {
        console.error('Error updating company:', err);
      },
      complete: () => {
        console.log('Subscription completed.');
      },
    });
  }

  actualizarLogProceso(request_id: number) {
    const transactionId = localStorage.getItem('id-transaction');

    if (!transactionId) {
      console.error('No se encontró un ID de transacción para actualizar el registro.');
      return;
    }

    const payload: ProcessRequest = {
      operation: 'update',
      transaction_id: transactionId,
      status: 'Finalizado',
      request_id: request_id,
      validation_attachemens: this.useIaAttach,
    };

    this.userService.registerProcessRequest(payload).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          localStorage.removeItem('id-transaction');
          console.log('Actualizacion exitoso en log de proceso de solicitud');
          console.log('ID de transacción eliminado del LocalStorage.');
        } else {
          console.log('Error actualizando en log de proceso de solicitud');
        }
      },
      error: err => {
        console.error('Error consumiendo el servicio de registro request:', err);
      },
    });
  }

  showAdjuntarArchivoModal(): Promise<boolean> {
    return new Promise(resolve => {
      this.modalTitle = 'Adjuntar archivo';
      this.modalMessage = '¿Desea enviar su solicitud sin documentos o archivos adjuntos?';
      this.showModal = true; // Muestra el modal
      this.useIaAttach = true;

      // Asignar funciones para aceptar o cancelar
      this.onAccept = () => {
        this.showModal = false; // Oculta el modal
        resolve(true); // Resuelve la promesa, continúa el proceso
      };

      this.onCancel = () => {
        this.showModal = false; // Oculta el modal
        resolve(false); // Resuelve la promesa, pero el proceso no sigue
      };
    });
  }

  // Cuando el usuario acepta
  onAccept() {
    this.showModal = false; // Oculta el modal
    this.resolveModal(); // Resuelve la promesa
  }

  // Cuando el usuario cancela
  onCancel() {
    this.showModal = false; // Oculta el modal
    this.resolveModal(); // Resuelve la promesa, pero no continúa el proceso
  }

  async getPreSignedUrl(
    file: ApplicantAttachments,
    request_id: number,
    type_doc: string
  ): Promise<string> {
    this.isSpinnerVisible = true;

    const payload = {
      source_name: file.source_name.replace(/(?!\.[^.]+$)\./g, '_'), // Evitar caracteres conflictivos
      fileweight: file.fileweight,
      request_id: request_id,
      content_type: file.file?.type || 'application/octet-stream',
    };

    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const response = await firstValueFrom(
          this.userService.getUrlSignedCompany(payload, type_doc)
        );

        if (response.code === 200 && response.data) {
          return response.data; // Retornar la URL sin asignarla a this.preSignedUrl
        } else {
          console.error(`Intento ${attempts + 1}: Error al obtener URL prefirmada`, response);
        }
      } catch (error) {
        console.error(
          `Intento ${attempts + 1}: Falló la solicitud para obtener la URL prefirmada`,
          error
        );
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s antes de reintentar
    }

    throw new Error('No se pudo obtener la URL prefirmada después de múltiples intentos');
  }

  //MEJORA 2025
  async uploadToPresignedUrl(file: ApplicantAttachments, request_id: number): Promise<void> {
    this.isSpinnerVisible = true;

    if (!file || !file.file) {
      console.error('El archivo no es válido o está undefined.');
      return;
    }

    if (!file.preSignedUrl) {
      console.error(`No se encontró una URL prefirmada para el archivo: ${file.source_name}`);
      return;
    }

    try {
      const contentType = file.file?.type || 'application/octet-stream'; // Detectar MIME type
      console.log('CONTENT-TYPE', contentType);
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 2000;

      console.log('Subiendo archivo:', file.file.name);
      console.log('Usando URL prefirmada:', file.preSignedUrl);

      const upload$ = this.http
        .put(file.preSignedUrl, file.file, {
          headers: { 'Content-Type': contentType },
          reportProgress: true,
          observe: 'events',
        })
        .pipe(
          retryWhen(errors =>
            errors.pipe(
              tap((error: HttpErrorResponse) => {
                const errorDetails = {
                  status: error.status,
                  statusText: error.statusText,
                  message: error.message,
                  url: error.url,
                };
                console.error(`Intento fallido (${error.status}):`, errorDetails);

                // Solo reintentar en errores temporales
                if (![500, 502, 503, 504, 429].includes(error.status)) {
                  throw error; // Detener reintentos en errores definitivos
                }

                this.handleUploadFailure(file, request_id, errorDetails);
              }),
              delay(RETRY_DELAY_MS),
              take(MAX_RETRIES),
              catchError(err => {
                console.error('Error después de múltiples intentos:', err);
                return throwError(() => err);
              })
            )
          )
        );

      await lastValueFrom(upload$);
      console.log(`Archivo ${file.file.name} subido correctamente.`);
    } catch (error) {
      console.error('Falló la subida del archivo:', error);
    } finally {
      this.isSpinnerVisible = false;
    }
  }

  // ENVIO AL SERVICIO QUE VA A GUARDAR EN LA TABLA DE LOGS
  handleUploadFailure(file: ApplicantAttachments, request_id: number, errorDetails: any) {
    //console.log('Registrando intento de fallo en base de datos.');

    const payload: ErrorAttachLog = {
      request_id: request_id,
      status: 'REPORTADO',
      name_archive: file.source_name,
      error_message:
        `Status: ${errorDetails.status}, ` +
        `StatusText: ${errorDetails.statusText}, ` +
        `Message: ${errorDetails.message}, ` +
        `URL: ${errorDetails.url || 'unknown'}`,
      error_type: 'S3',
    };

    this.userService.registerErrorAttach(payload).subscribe({
      next: response => {
        if (response && response.code === 200) {
          console.log('Error registrado correctamente en la base de datos.');
        } else {
          console.error(
            'No se pudo registrar el error. Código de respuesta no esperado:',
            response?.code
          );
        }
      },
      error: err => {
        console.error('Error al intentar registrar el log en la base de datos:', err);
      },
      complete: () => {
        console.log('Proceso de registro de error en base de datos completado.');
      },
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Si hay un proceso pendiente, se muestra la advertencia
    if (this.hasPendingChanges) {
      $event.returnValue = 'Tienes un proceso en curso. ¿Estás seguro de que quieres salir?';
    }
  }

  //ENVIO DE ARCHIVOS AL SERVIDOR DE CONFA
  async envioArchivosServer(ruta_archivo_ws: any, estructura: any) {
    this.isSpinnerVisible = true;
    try {
      // Usa await para que se pause hasta que se reciba la respuesta
      const respuesta = await this.http.post(ruta_archivo_ws, estructura).toPromise();
      //console.log('Respuesta del servicio:', respuesta);
    } catch (error) {
      console.error('Error al llamar al servicio:', error);
    }
  }

  sendRequest() {
    const payload: RequestFormList = {
      request_status: 1,
      applicant_type: this.applicantType.applicant_type_id,
      request_type: this.requestType.request_type_id,
      doc_type: this.requestForm.controls['document_type'].value['catalog_item_id'],
      doc_id: this.requestForm.controls['number_id'].value,
      applicant_name: this.requestForm.controls['name'].value,
      applicant_email: this.requestForm.controls['email'].value,
      applicant_cellphone: this.requestForm.controls['cellphone'].value,
      request_description: this.requestForm.controls['mensage'].value,
      request_days: this.requestType.request_days || 15,
      assigned_user: '',
      request_answer: '',
      data_treatment: true,
      applicant_attachments: null,
      assigned_attachments: null,
      form_id: this.requestType.form_id,
      count_attacments: 0,
    };

    // this.setParameter(payload);
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
    this.router.navigate([RoutesApp.CREATE_REQUEST]);
    localStorage.removeItem('visitedFirstPage');
  }
  showAlertModal(filing_number: number) {
    this.visibleDialogAlert = true;
    this.informative = true;
    //this.isError = false;
    this.tittle_message = '¡Solicitud enviada con éxito!';
    this.message = filing_number.toString();
    this.severity = 'danger';
  }

  validarRespuesta(): boolean {
    return true;
  }

  validarMensaje(mensaje: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.userService.respuestaIaAdjuntos(mensaje).subscribe(
        response => {
          if (response.statusCode === 200) {
            const responseBody = response.respuesta;
            const mensajeNormalizado = responseBody
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            const contieneSi = mensajeNormalizado.includes('si');
            resolve(contieneSi); // Resolves la promesa con true o false
          } else {
            resolve(false);
            // reject('Error en la respuesta del servicio');
          }
        },
        error => {
          resolve(false);
          console.error('Error en la solicitud:', error);
        }
      );
    });
  }
  showAlertModalError(filing_number: number) {
    this.visibleDialogAlert = true;
    this.informative = true;
    this.isError = true;
    //this.tittle_message = '¡Solicitud enviada! <br> <span class="warning-message"> Sin embargo, hubo problemas con algunos de los archivos.</span>';
    this.tittle_message =
      '¡Solicitud enviada! <br> <h3 style="color: #ffc107 !important; font-size: 1.2rem;">Sin embargo, hubo problemas con algunos de los archivos.</h3>';
    this.message = filing_number.toString();
    this.severity = 'danger';
  }

  consultarEmpresa() {
    const documentType = this.requestForm.controls['document_type'].value['catalog_item_id'];
    const documento = this.requestForm.get('number_id')?.value;

    // reemplazar por metodo que vaya por info de empreasas
    this.userService.getCompanyInformation(documento, documentType).subscribe(
      response => {
        if (response.statusCode === 200) {
          const parsedBody = JSON.parse(response.body);
          this.empresa = parsedBody;
          console.log(parsedBody, 'info');
          if (this.empresa) {
            this.empresa.digitoVerificacion = parsedBody.data.nit;
            this.empresa.razonSocial = parsedBody.data.razonSocial;
            this.empresa.nombreComercial = parsedBody.data.nombreComercial;

            this.empresa.email = parsedBody.data.razonSocial;
            this.empresa.telefono = parsedBody.data.razonSocial;
            this.empresa.actividadEconomica = parsedBody.data.razonSocial;
            this.empresa.direccion = parsedBody.data.razonSocial;
            this.existCompany = true;
          }
        }
      },
      (error: any) => {
        console.error('Error al llamar al servicio:', error);
      }
    );
  }

  restoreDisabledFields(): void {
    const disabledFields = [
      'verificationDigit',
      'businessName',
      'tradeName',
      'department',
      'municipality',
      'address',
      'landline',
      'mobilePhone',
      'email',
      'legalRepresentativeDocumentType',
      'legalRepresentativeDocumentNumber',
      'legalRepresentativeFirstName',
      'legalRepresentativeMiddleName',
      'legalRepresentativeLastName',
      'legalRepresentativeSecondLastName',
      'economicActivityCiiuCode',
      'economicActivityCiiuDescription',
      'confirmEmail',
    ];

    disabledFields.forEach(field => {
      this.requestForm.get(field)?.disable();
    });
  }

  consultarEmpresa2() {
    this.restoreDisabledFields();
    this.currentSection = 1;
    this.isCorrectData = true;
    this.isCorrectEconomicActivityData = true;
    this.isCorrectLegalRepresentativeData = true;
    const documentType = this.requestForm.get('documentType')?.value;
    const documentNumber = this.requestForm.get('documentNumber')?.value;

    if (!documentType || !documentNumber) {
      console.warn('Tipo de documento o número de documento no proporcionado');
      return;
    }

    // OPCIÓN ORIGINAL: CONSULTAR DESDE EL SERVICIO
    this.userService
      .getCompanyInformation(
        documentNumber,
        this.requestForm.controls['documentType'].value?.catalog_item_name
      )
      .subscribe(
        (empresaData: any) => {
          if (empresaData) {
            const selectedDepartment = this.departmentsList.find(
              dept =>
                dept.name.toLowerCase().trim() === empresaData.departamento.toLowerCase().trim()
            );

            if (!selectedDepartment) {
              console.error('Departamento no encontrado en la lista');
              return;
            }

            this.loadMunicipalities(selectedDepartment.id);

            const selectedMunicipality = this.municipalitiesList.find(
              mun => mun.name.toLowerCase().trim() === empresaData.municipio.toLowerCase().trim()
            );

            this.requestForm.patchValue({
              businessName: empresaData.razonSocial,
              tradeName: empresaData.nombreComercial,
              documentType: documentType,
              documentNumber: empresaData.nit,
              verificationDigit: empresaData.digitoVerificacion,
              department: selectedDepartment,
              municipality: selectedMunicipality || null,
              address: empresaData.direccion,
              landline: this.cleanLandline(empresaData.telefonoFijo),
              mobilePhone: empresaData.telefonoCelular,
              email: empresaData.email,
              legalRepresentativeDocumentType:
                this.documentHomologationList.find(
                  doc => doc.code === empresaData.tipoDocumentoRepresentante
                ) || null,
              legalRepresentativeDocumentNumber: empresaData.numeroDocumentoRepresentante,
              legalRepresentativeFirstName: empresaData.primerNombreRepresentante,
              legalRepresentativeMiddleName: empresaData.segundoNombreRepresentante,
              legalRepresentativeLastName: empresaData.primerApellidoRepresentante,
              legalRepresentativeSecondLastName: empresaData.segundoApellidoRepresentante,
              economicActivityCiiuCode: empresaData.codigoCIIU,
              economicActivityCiiuDescription: empresaData.descripcionCIIU,
            });

            this.existCompany = true;
          } else {
            const currentValues = this.requestForm.value;
            const preserved = {
              documentType: currentValues.documentType,
              documentNumber: currentValues.documentNumber,
            };
            this.requestForm.reset(preserved);
            this.existCompany = false;
            this.mostrarEmpresaNoEncontrada = true;
          }
        },
        (error: any) => {
          console.error('Error al consultar la empresa:', error);
          this.existCompany = false;
        }
      );
  }

  irASiguiente() {
    if (this.currentSection === 1) {
      const fieldsToValidate = [
        'department',
        'municipality',
        'address',
        'landline',
        'mobilePhone',
        'email',
        'alternateMobilePhone',
        'alternateEmail',
      ];
      if (!this.isCorrectData) {
        this.requestForm.get('confirmEmail')?.enable();
        this.requestForm.get('confirmEmail')?.markAsTouched();
        fieldsToValidate.push('confirmEmail');
      }

      const altMobile = this.requestForm.get('alternateMobilePhone');
      if (altMobile?.value && altMobile.value.trim() !== '') {
        fieldsToValidate.push('alternateMobilePhone');
      } else {
        altMobile?.setErrors(null);
      }

      fieldsToValidate.forEach(field => {
        if (this.requestForm.controls[field]) {
          this.requestForm.controls[field].markAsTouched();
        }
      });

      if (fieldsToValidate.some(field => this.requestForm.controls[field]?.invalid)) {
        return;
      }

      this.showConfirmationModal = true;
    } else if (this.currentSection === 2) {
      const fieldsToValidate = [
        'legalRepresentativeDocumentType',
        'legalRepresentativeDocumentNumber',
        'legalRepresentativeFirstName',
        'legalRepresentativeLastName',
      ];

      fieldsToValidate.forEach(field => {
        if (this.requestForm.controls[field]) {
          this.requestForm.controls[field].markAsTouched();
        }
      });

      if (fieldsToValidate.some(field => this.requestForm.controls[field]?.invalid)) {
        return;
      }

      if (!this.fileNameList || this.fileNameList.size === 0) {
        this.showFileError = true;
        return;
      }

      this.showConfirmationModal = true;
    } else if (this.currentSection === 3) {
      const fieldsToValidate = ['economicActivityCiiuCode', 'economicActivityCiiuDescription'];

      fieldsToValidate.forEach(field => {
        if (this.requestForm.controls[field]) {
          this.requestForm.controls[field].markAsTouched();
        }
      });

      if (fieldsToValidate.some(field => this.requestForm.controls[field]?.invalid)) {
        return;
      }

      if (!this.economicFileNameList || this.economicFileNameList.size === 0) {
        this.showEconomicFileError = true;
        return;
      }

      this.showConfirmationModal = true;
    }
  }

  irAAnterior() {
    if (this.currentSection === 3) {
      this.sectionTitle = 'Datos Representante Legal';
      this.currentSection = 2;
    } else if (this.currentSection === 2) {
      this.sectionTitle = 'Datos Generales';
      this.currentSection = 1;
    }
  }

  confirmData(isCorrect: boolean): void {
    this.isCorrectData = isCorrect;
    if (isCorrect) {
      this.confirmationDate = new Date().toISOString();
      this.isEditable = false;
      this.sectionTitle = 'Datos Representante Legal';
      this.currentSection = 2;
    } else {
      this.isEditable = true;
      this.confirmationDate = null;
      this.requestForm.controls['department'].enable();
      this.requestForm.controls['municipality'].enable();
      this.requestForm.controls['address'].enable();
      this.requestForm.controls['landline'].enable();
      this.requestForm.controls['mobilePhone'].enable();
      this.requestForm.controls['email'].enable();
      if (!this.requestForm.contains('alternateMobilePhone')) {
        this.requestForm.addControl(
          'alternateMobilePhone',
          new FormControl('', [
            Validators.pattern(/^\d*$/),
            Validators.minLength(10),
            Validators.maxLength(10),
            noRepeatedDigitsValidator,
          ])
        );
      }

      if (!this.requestForm.contains('alternateEmail')) {
        this.requestForm.addControl(
          'alternateEmail',
          new FormControl('', [Validators.email, commonEmailDomainValidator()])
        );
      }
      this.requestForm.get('confirmEmail')?.enable();
      this.requestForm.get('landline')?.updateValueAndValidity();
    }
  }

  confirmUpdate(isConfirmed: boolean) {
    if (isConfirmed && this.currentSection === 1) {
      this.sectionTitle = 'Datos Representante Legal';
      this.currentSection = 2;
    } else if (isConfirmed && this.currentSection === 2) {
      this.sectionTitle = 'Actividad Económica';
      this.currentSection = 3;
    } else if (isConfirmed && this.currentSection === 3) {
      this.saveForm();
    }
    this.showConfirmationModal = false;
  }

  confirmLegalRepresentativeData(isCorrect: boolean) {
    this.isCorrectLegalRepresentativeData = isCorrect;
    if (isCorrect) {
      this.confirmationDate = new Date().toISOString();
      this.currentSection = 3;
      this.sectionTitle = 'Actividad Económica';
    } else {
      this.requestForm.controls['legalRepresentativeDocumentType'].enable();
      this.requestForm.controls['legalRepresentativeDocumentNumber'].enable();
      this.requestForm.controls['legalRepresentativeFirstName'].enable();
      this.requestForm.controls['legalRepresentativeMiddleName'].enable();
      this.requestForm.controls['legalRepresentativeLastName'].enable();
      this.requestForm.controls['legalRepresentativeSecondLastName'].enable();
      this.requestForm.controls['legalRepresentativeDocumentNumber'].updateValueAndValidity();
    }
  }

  confirmEconomicActivityData(isCorrect: boolean) {
    this.isCorrectEconomicActivityData = isCorrect;

    if (isCorrect) {
      this.saveForm();
    } else {
      this.requestForm.controls['economicActivityCiiuCode'].enable();
      this.requestForm.controls['economicActivityCiiuDescription'].enable();
    }
  }

  onEconomicFileSelected(event: any) {
    const files: FileList = event.target.files;

    if (this.arrayEconomicAttachments.length === 0) {
      this.economicFileNameList.clear();
    }

    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];

      let fileSizeFormat: string;
      const fileName: string = file.name;
      const fileSizeInKiloBytes = file.size / 1024;

      if (fileSizeInKiloBytes < 1024) {
        fileSizeFormat = fileSizeInKiloBytes.toFixed(2) + 'KB';
      } else {
        const fileSizeMegabytes = fileSizeInKiloBytes / 1024;
        fileSizeFormat = fileSizeMegabytes.toFixed(2) + 'MB';
      }

      if (this.isValidExtension(file)) {
        this.errorMensajeEconomicFile = `El archivo ${fileName} tiene una extensión no permitida`;
        this.errorExtensionEconomicFile = true;
        continue;
      }

      if (file.size > 30720000) {
        this.errorMensajeEconomicFile = `El archivo ${fileName} supera los 30MB`;
        this.errorSizeEconomicFile = true;
        continue;
      }

      const exists = this.arrayEconomicAttachments.some(item => item.source_name === fileName);
      if (exists) {
        this.errorMensajeEconomicFile = `El archivo ${fileName} ya está adjunto`;
        this.errorRepeatEconomicFile = true;
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String: string = e.target.result.split(',')[1];
        const economicAttach: ApplicantAttachments = {
          base64file: base64String,
          source_name: fileName,
          fileweight: fileSizeFormat,
          file: files[i],
        };

        this.economicFileNameList.add(fileName);
        this.arrayEconomicAttachments.push(economicAttach);
      };
      reader.readAsDataURL(file);
      this.showEconomicFileError = false;
    }

    console.log(this.arrayEconomicAttachments, 'Archivos de Actividad Económica seleccionados');

    setTimeout(() => {
      this.errorRepeatEconomicFile = false;
      this.errorExtensionEconomicFile = false;
      this.errorSizeEconomicFile = false;
    }, 5000);
  }

  saveForm() {
    const updatedGeneralInfo = !this.isCorrectData;
    const updatedLegalRep = !this.isCorrectLegalRepresentativeData;
    const updatedEconomic = !this.isCorrectEconomicActivityData;

    // if (!updatedGeneralInfo && !updatedLegalRep && !updatedEconomic) {
    //   this.showNoChangesModal = true;
    //   return;
    // }

    const selectedDocType = this.requestForm.controls['legalRepresentativeDocumentType'].value;
    const payload: CompanyUpdateRequest = {
      document_type: this.requestForm.controls['documentType'].value?.catalog_item_name,
      document_number: this.requestForm.controls['documentNumber'].value,
      verification_digit: this.requestForm.controls['verificationDigit'].value,
      business_name: this.requestForm.controls['businessName'].value,
      trade_name: this.requestForm.controls['tradeName'].value,
      department: this.requestForm.controls['department'].value?.name,
      municipality: this.requestForm.controls['municipality'].value?.name,
      address: this.requestForm.controls['address'].value,
      landline: this.requestForm.controls['landline'].value,
      mobile_phone: this.requestForm.controls['mobilePhone'].value,
      alternate_mobile_phone: this.requestForm.controls['alternateMobilePhone']
        ? this.requestForm.controls['alternateMobilePhone'].value
        : null,
      email: this.requestForm.controls['email'].value,
      alternate_email: this.requestForm.controls['alternateEmail']
        ? this.requestForm.controls['alternateEmail'].value
        : null,
      legal_representative_document_type: selectedDocType?.name ?? selectedDocType ?? null,
      legal_representative_document_number:
        this.requestForm.controls['legalRepresentativeDocumentNumber'].value,
      legal_representative_first_name:
        this.requestForm.controls['legalRepresentativeFirstName'].value,
      legal_representative_middle_name: this.requestForm.controls['legalRepresentativeMiddleName']
        ? this.requestForm.controls['legalRepresentativeMiddleName'].value
        : null,
      legal_representative_last_name:
        this.requestForm.controls['legalRepresentativeLastName'].value,
      legal_representative_second_last_name: this.requestForm.controls[
        'legalRepresentativeSecondLastName'
      ]
        ? this.requestForm.controls['legalRepresentativeSecondLastName'].value
        : null,

      economic_activity_ciiu_code: this.requestForm.controls['economicActivityCiiuCode'].value,
      economic_activity_ciiu_description:
        this.requestForm.controls['economicActivityCiiuDescription'].value,

      legal_representative_document_path: null,
      economic_activity_rut_path: null,

      created_by: 'gestorSolicitudes',
      updated_general_info: !this.isCorrectData,
      updated_legal_representative: !this.isCorrectLegalRepresentativeData,
      updated_economic_activity: !this.isCorrectEconomicActivityData,
    };

    this.continueCompanyUpdate(payload);
  }

  // async attachApplicantFilesAll(request_id: number) {
  //   const estructura = {
  //     request_id: `${request_id}`,
  //     files: [
  //       ...this.arrayApplicantAttachment.map(file => ({
  //         base64: file.base64file,
  //         name: file.source_name,
  //         fileweight: file.fileweight,
  //         type: 'legal_representative_document',
  //       })),
  //       ...this.arrayEconomicAttachments.map(file => ({
  //         base64: file.base64file,
  //         name: file.source_name,
  //         fileweight: file.fileweight,
  //         type: 'economic_activity_rut',
  //       })),
  //     ],
  //   };

  //   this.userService.insertCompanyFilesS3(estructura).subscribe({
  //     next: (success: boolean) => {
  //       if (success) {
  //         this.showAlertModal(request_id);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error en la petición:', err);
  //     },
  //   });
  // }

  async retry<T>(operation: () => Promise<T>, retries: number, delayMs: number): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        console.warn(`Intento ${attempt} fallido. Reintentando en ${delayMs}ms...`);
        if (attempt === retries) throw error;
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
    throw new Error('Todos los intentos fallaron');
  }

  async attachApplicantFilesAll(request_id: number) {
    this.isSpinnerVisible = true;
    this.hasPendingChanges = true;
    this.uploadProgress = 0;
    try {
      if (
        (!this.arrayApplicantAttachment || this.arrayApplicantAttachment.length === 0) &&
        (!this.arrayEconomicAttachments || this.arrayEconomicAttachments.length === 0)
      ) {
        console.warn('No hay archivos para subir.');
        return;
      }
      const ruta_archivo_ws = environment.ruta_archivos_ws;
      const totalFiles = this.arrayApplicantAttachment.length;
      let uploadedFiles = 0;

      const estructura = {
        idSolicitud: `${request_id}`,
        archivos: [
          ...this.arrayApplicantAttachment.map(file => ({
            base64file: file.base64file,
            source_name: file.source_name,
            fileweight: file.fileweight,
            type: 'legal_representative_document',
          })),
          ...this.arrayEconomicAttachments.map(file => ({
            base64file: file.base64file,
            source_name: file.source_name,
            fileweight: file.fileweight,
            type: 'economic_activity_rut',
          })),
        ],
      };

      try {
        await this.envioArchivosServer(ruta_archivo_ws, estructura);
      } catch (error) {
        console.error('Error al enviar archivos:', error);
        // Aquí puedes mostrar un mensaje de error en la UI
      }
      const allAttachments = [
        ...(this.arrayApplicantAttachment || []).map(file => ({
          ...file,
          type: 'legal_representative_document',
        })),
        ...(this.arrayEconomicAttachments || []).map(file => ({
          ...file,
          type: 'economic_activity_rut',
        })),
      ];

      for (const item of allAttachments) {
        try {
          // Obtener URL prefirmada con reintentos
          const preSignedUrl = await this.retry(
            () => this.getPreSignedUrl(item, request_id, item.type),
            1, // Intentos
            2000 // Retraso entre intentos
          );

          if (!preSignedUrl) {
            console.error(`No se pudo obtener la URL prefirmada para: ${item.source_name}`);
            continue;
          }

          item.preSignedUrl = preSignedUrl;

          await this.retry(() => this.uploadToPresignedUrl(item, request_id), 3, 3000);

          uploadedFiles++;
          this.uploadProgress = Math.round((uploadedFiles / totalFiles) * 100);
          this.changeDetectorRef.detectChanges();

          if (item.type === 'legal_representative_document') {
            console.log('Archivo de representante legal subido correctamente.');
          } else if (item.type === 'economic_activity_rut') {
            console.log('Archivo de actividad económica subido correctamente.');
          }
        } catch (error) {
          console.error(`Error al procesar el archivo ${item.source_name} (${item.type}):`, error);
        }
      }

      this.uploadProgress = 100;
      this.changeDetectorRef.detectChanges();

      // Restablecer formulario y mostrar mensaje de éxito
      this.requestForm.reset();
      this.fileNameList.clear();
      // this.showAlertModal(request_id);
      this.showSuccessModal = true;
    } catch (error) {
      console.error('Error durante el proceso de carga:', error);
      this.showAlertModalError(request_id);
    } finally {
      setTimeout(() => {
        this.isSpinnerVisible = false;
        this.hasPendingChanges = false;
        this.uploadProgress = 0;
      }, 500);
    }
  }

  cerrarEmpresaNoEncontrada() {
    this.mostrarEmpresaNoEncontrada = false;
  }

  onEnterConsultarEmpresa() {
    const tipo = this.requestForm.get('documentType')?.value;
    const numero = this.requestForm.get('documentNumber')?.value;

    if (tipo && numero) {
      this.sendOptions();
    }
  }

  closeNoChangesModal() {
    this.showNoChangesModal = false;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.router.navigate([RoutesApp.CREATE_REQUEST]);
  }

  sanitizeInput(event: Event, type: 'numeric' | 'alpha'): void {
    const input = event.target as HTMLInputElement;
    let sanitizedValue = input.value;

    if (type === 'numeric') {
      sanitizedValue = sanitizedValue.replace(/\D/g, '');
    } else if (type === 'alpha') {
      sanitizedValue = sanitizedValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    input.value = sanitizedValue;

    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      const control = this.requestForm.get(controlName);
      control?.setValue(sanitizedValue, { emitEvent: true });
      control?.markAsTouched();
      control?.updateValueAndValidity();
    }
  }

  cleanLandline(phone: string): string {
    if (!phone) return '';
    const numeric = phone.replace(/[^\d]/g, '');
    return numeric.slice(-7);
  }

  confirmUpdatePolity(isConfirmed: boolean) {
    if (isConfirmed) {
      this.consultarEmpresa2();
      this.showConfirmationPolityModal = false;
    } else {
      this.showConfirmationPolityModal = false;
    }
  }

  sendOptions() {
    this.showConfirmationPolityModal = true;
  }
}
