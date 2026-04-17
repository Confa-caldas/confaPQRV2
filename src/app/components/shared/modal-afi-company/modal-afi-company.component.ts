import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiliationCompanyList, AfiTemplateValidationList, GenderList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';


@Component({
  selector: 'app-modal-afi-company',
  templateUrl: './modal-afi-company.component.html',
  styleUrl: './modal-afi-company.component.scss'
})
export class ModalAfiCompanyComponent {
@Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() AfiCompanyForm?: AfiliationCompanyList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AfiliationCompanyList>();

  inputValue: string[] = [''];
  AfiCompanyList!: AfiliationCompanyList[];

  // Ajusta valores según tu negocio (CC, NIT, TI, CE, etc.)
  tipoDocOptions = [
    { label: 'NIT', value: 'NIT' },
    { label: 'CC', value: 'CC' },
    { label: 'TI', value: 'TI' },
    { label: 'CE', value: 'CE' },
  ];

  consultLoading = false;
  hasConsulted = false;

  formGroup = new FormGroup({
    id_empresa: new FormControl<number | null>(null),

    tipo_documento: new FormControl<string | null>(null, Validators.required),
    numero_documento: new FormControl<string | null>(null, Validators.required),

    nombre_comercial: new FormControl<string | null>({ value: null, disabled: true }),
    razonSocial: new FormControl<string | null>({ value: null, disabled: true }),
    email: new FormControl<string | null>({ value: null, disabled: true }),
    direccion: new FormControl<string | null>({ value: null, disabled: true }),
    telefono: new FormControl<string | null>({ value: null, disabled: true }),
    estado_afiliacion: new FormControl<string | null>({ value: null, disabled: true }),
    esta_activa: new FormControl<boolean | null>({ value: null, disabled: true }),
    representante_legal: new FormControl<string | null>({ value: null, disabled: true }),
    permite_afiliaciones_masivas: new FormControl<boolean>(false),
    contacto: new FormControl<string | null>({ value: null, disabled: true }),
  });

  constructor(private userService: Users) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['AfiCompanyForm'] || changes['read_only']) {
      if (this.AfiCompanyForm) {
        this.hasConsulted = true;
        const d = this.AfiCompanyForm;

        this.formGroup.patchValue({
          id_empresa: d.id_empresa ?? null,
          tipo_documento: d.tipo_documento ?? null,
          numero_documento: d.numero_documento ?? null,
          nombre_comercial: d.nombre_comercial ?? null,
          razonSocial: d.razonSocial ?? (d as any).razon_social ?? null,
          email: d.email ?? null,
          direccion: d.direccion ?? null,
          telefono: d.telefono ?? null,
          estado_afiliacion: d.estado_afiliacion ?? null,
          esta_activa: d.esta_activa ?? null,
          permite_afiliaciones_masivas: d.permite_afiliaciones_masivas ?? false,
          contacto: d.contacto ?? null,
          representante_legal: d.representante_legal ?? null,
        });
      } else {
        this.hasConsulted = false;
        this.formGroup.reset({
          id_empresa: null,
          tipo_documento: null,
          numero_documento: null,
          permite_afiliaciones_masivas: false,
        });
      }

      // Readonly: deshabilita todo
      if (this.read_only) {
        this.formGroup.disable({ emitEvent: false });
      } else {
        this.formGroup.enable({ emitEvent: false });

        // Mantener campos de consulta en solo lectura
        this.formGroup.get('nombre_comercial')?.disable({ emitEvent: false });
        this.formGroup.get('razonSocial')?.disable({ emitEvent: false });
        this.formGroup.get('email')?.disable({ emitEvent: false });
        this.formGroup.get('direccion')?.disable({ emitEvent: false });
        this.formGroup.get('telefono')?.disable({ emitEvent: false });
        this.formGroup.get('estado_afiliacion')?.disable({ emitEvent: false });
        this.formGroup.get('esta_activa')?.disable({ emitEvent: false });
        this.formGroup.get('representante_legal')?.disable({ emitEvent: false });
        this.formGroup.get('contacto')?.disable({ emitEvent: false });
      }
    }
  }

  get consultDisabled(): boolean {
    const tipo = this.formGroup.get('tipo_documento')?.value;
    const doc = this.formGroup.get('numero_documento')?.value;
    return this.consultLoading || !tipo || !doc;
  }

  consultarEmpresa(): void {
    const tipoDoc = this.formGroup.get('tipo_documento')?.value;
    const doc = this.formGroup.get('numero_documento')?.value;

    if (!tipoDoc || !doc) {
      this.formGroup.get('tipo_documento')?.markAsTouched();
      this.formGroup.get('numero_documento')?.markAsTouched();
      return;
    }

    this.consultLoading = true;

    this.userService.getCompanyInformation(doc, tipoDoc).subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? resp;

        this.formGroup.patchValue({
          nombre_comercial: data?.nombreComercial ?? data?.nombre_comercial ?? null,
          razonSocial: data?.razonSocial ?? data?.razon_social ?? null,
          email: data?.email ?? null,
          direccion: data?.direccion ?? null,
          telefono: data?.telefonoCelular ?? data?.telefonoFijo ?? null,
          estado_afiliacion: data?.estadoEmpresa ?? null,
          representante_legal: data?.nombreCompletoRepresentante ?? null,
          contacto: data?.contacto ?? null,
          esta_activa: data?.estadoEmpresa ?? null,
        });

        this.hasConsulted = true;
      },
      error: (err) => {
        console.log(err);
        this.hasConsulted = false;
      },
      complete: () => {
        this.consultLoading = false;
      }
    });
  }

  get saveDisabled(): boolean {
    if (this.read_only) return true;
    return !this.hasConsulted || this.consultLoading;
  }

  guardar(): void {
    const raw = this.formGroup.getRawValue();

    const payload: AfiliationCompanyList = {
      id_empresa: raw.id_empresa ?? undefined,
      tipo_documento: raw.tipo_documento ?? undefined,
      numero_documento: raw.numero_documento ?? undefined,
      nombre_comercial: raw.nombre_comercial ?? undefined,
      razonSocial: raw.razonSocial ?? undefined,
      email: raw.email ?? undefined,
      direccion: raw.direccion ?? undefined,
      telefono: raw.telefono ?? undefined,
      estado_afiliacion: raw.estado_afiliacion ?? undefined,
      esta_activa: raw.esta_activa ?? undefined,
      representante_legal: raw.representante_legal ?? undefined,
      contacto: raw.representante_legal ?? undefined,
      permite_afiliaciones_masivas: !!raw.permite_afiliaciones_masivas,
    };

    this.setRta.emit(true);
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    this.visible = false;

    this.hasConsulted = false;
    this.consultLoading = false;

    this.formGroup.reset({
      id_empresa: null,
      tipo_documento: null,
      numero_documento: null,
      permite_afiliaciones_masivas: false
    }, { emitEvent: false });
  }
}
