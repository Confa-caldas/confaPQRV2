import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface DatosPersonaModal {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaExpedicionDoc?: string | null;
  fechaNacimiento?: string | null;
}

@Component({
  selector: 'app-modal-search-person-data',
  templateUrl: './modal-search-person-data.component.html',
  styleUrl: './modal-search-person-data.component.scss',
})
export class ModalSearchPersonDataComponent implements OnChanges {
  @Input() visible = false;
  @Input() datosPersona: DatosPersonaModal | null = null;

  @Output() consultar = new EventEmitter<{ tipoDocumento: string; numeroDocumento: string }>();
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardarNovedad = new EventEmitter<DatosPersonaModal>();

  readonly tiposDocumento = [
    { label: 'Cédula extranjería', value: 'CEDULA_EXTRANJERIA' },
    { label: 'Permiso de protección temporal', value: 'PERMISO_PROTECCION_TEMPORAL' },
  ];

  searchForm: FormGroup;
  dataForm: FormGroup;
  /** Se muestra después de dar a Consultar (con datos dummy o respuesta del padre). */
  showDataSection = false;

  private readonly dummyData: DatosPersonaModal = {
    primerNombre: 'María',
    segundoNombre: 'Fernanda',
    primerApellido: 'García',
    segundoApellido: 'López',
    fechaExpedicionDoc: '2020-05-15',
    fechaNacimiento: '1992-08-20',
  };

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      tipoDocumento: ['CEDULA_EXTRANJERIA'],
      numeroDocumento: [''],
    });
    this.dataForm = this.fb.group({
      primerNombre: [''],
      segundoNombre: [''],
      primerApellido: [''],
      segundoApellido: [''],
      fechaExpedicionDoc: [null as string | null],
      fechaNacimiento: [null as string | null],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosPersona'] && this.datosPersona) {
      this.patchDataForm(this.datosPersona);
      this.showDataSection = true;
    }
    if (changes['visible'] && !this.visible) {
      this.showDataSection = false;
    }
  }


  private patchDataForm(datos: DatosPersonaModal): void {
    const toDate = (s: string | null | undefined) => (s && String(s).length >= 10 ? String(s).substring(0, 10) : null);
    this.dataForm.patchValue({
      primerNombre: datos.primerNombre ?? '',
      segundoNombre: datos.segundoNombre ?? '',
      primerApellido: datos.primerApellido ?? '',
      segundoApellido: datos.segundoApellido ?? '',
      fechaExpedicionDoc: toDate(datos.fechaExpedicionDoc),
      fechaNacimiento: toDate(datos.fechaNacimiento),
    });
  }

  onConsultar(): void {
    const { tipoDocumento, numeroDocumento } = this.searchForm.getRawValue();
    this.consultar.emit({
      tipoDocumento: tipoDocumento || 'CEDULA_EXTRANJERIA',
      numeroDocumento: String(numeroDocumento || '').trim(),
    });
    // Mostrar sección con datos dummy si el padre no envía datosPersona (por ahora siempre dummy)
    this.patchDataForm(this.dummyData);
    this.showDataSection = true;
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  onGuardarNovedad(): void {
    this.guardarNovedad.emit(this.dataForm.getRawValue());
  }
}
