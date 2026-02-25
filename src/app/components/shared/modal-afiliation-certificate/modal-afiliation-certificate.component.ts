import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiCertificateList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-afiliation-certificate',
  templateUrl: './modal-afiliation-certificate.component.html',
  styleUrl: './modal-afiliation-certificate.component.scss'
})
export class ModalAfiliationCertificateComponent implements OnInit {
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() afiCertificateForm?: AfiCertificateList;

  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AfiCertificateList>();

  tipoCertificadoOptions = [
    { label: 'Solo trabajador o beneficiario', value: 'Solo trabajador o beneficiario' },
    { label: 'Trabajador y sus beneficiarios', value: 'Trabajador y sus beneficiarios' },
  ];

  tipoSolicitanteOptions = [
    { label: 'Empresa', value: 'EMPRESA' },
    { label: 'Interesado/a', value: 'INTERESADO' },
  ];

  //Firma
  fileError: string = '';
  firmaPreview: string | null = null;

  formGroup: FormGroup = new FormGroup({
    id: new FormControl<number | null>(null),

    tipo_certificado: new FormControl<string | null>(null, [Validators.required]),
    encabezado: new FormControl<string | null>(null, [Validators.required]),
    textos_fijos: new FormControl<string | null>(null, [Validators.required]),
    clausulas_legales: new FormControl<string | null>(null, [Validators.required]),
    tipo_solicitante: new FormControl<string | null>(null, [Validators.required]),
    texto_justificacion: new FormControl<string | null>(null, [Validators.required]),
    nombre_responsable_firma: new FormControl<string | null>(null, [Validators.required]),
    cargo_responsable_firma: new FormControl<string | null>(null, [Validators.required]),

    //firma se envían al back
    firma_mime: new FormControl<string | null>(null, [Validators.required]),
    firma_byte: new FormControl<string | null>(null, [Validators.required]),
  });

  constructor(
    private userService: Users
  ) {}

  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.afiCertificateForm) {

      const firmaMime = this.afiCertificateForm.firma_mime ?? null;
      const firmaBase64 = this.afiCertificateForm.firma_byte ?? this.afiCertificateForm.firma_bytes ?? null;

      this.formGroup.patchValue({
        id: this.afiCertificateForm.id ?? null,
        tipo_certificado: this.afiCertificateForm.tipo_certificado ?? null,
        encabezado: this.afiCertificateForm.encabezado ?? null,
        textos_fijos: this.afiCertificateForm.textos_fijos ?? null,
        clausulas_legales: this.afiCertificateForm.clausulas_legales ?? null,
        tipo_solicitante: this.afiCertificateForm.tipo_solicitante ?? null,
        texto_justificacion: this.afiCertificateForm.texto_justificacion ?? null,
        nombre_responsable_firma: this.afiCertificateForm.nombre_responsable_firma ?? null,
        cargo_responsable_firma: this.afiCertificateForm.cargo_responsable_firma ?? null,
        
        firma_mime: firmaMime,
        firma_byte: firmaBase64,
      });

      // preview si ya viene firma (si viene base64 completo con dataURL)
      this.firmaPreview = this.buildPreview(this.afiCertificateForm.firma_mime, this.afiCertificateForm.firma_byte);
    } else {
      this.formGroup.reset();
      this.firmaPreview = null;
      this.fileError = '';
    }

    // patrón simple “no caracteres raros”
    const noRaros = Validators.pattern('^[^#$%&]+$');
    ['encabezado','textos_fijos','clausulas_legales','texto_justificacion','nombre_responsable_firma','cargo_responsable_firma']
      .forEach(k => this.formGroup.get(k)?.addValidators(noRaros));
    this.formGroup.updateValueAndValidity();
    this.applyReadOnly();
  }

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['read_only'] && this.formGroup) {
    this.applyReadOnly();
  }
}

private applyReadOnly(): void {
  if (this.read_only) {
    this.formGroup.disable({ emitEvent: false });
  } else {
    this.formGroup.enable({ emitEvent: false });
  }

  // id siempre disabled (no editable)
  this.formGroup.get('id')?.disable({ emitEvent: false });
}


  async onFileSelected(event: Event) {
    this.fileError = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    //validar tipo
    const allowed = ['image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      this.fileError = 'Solo se permiten imágenes PNG o JPG.';
      this.formGroup.patchValue({ firma_mime: null, firma_byte: null });
      this.firmaPreview = null;
      return;
    }

    // (opcional) validar tamaño, ej 1MB
    const maxBytes = 1 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.fileError = 'La imagen supera 1MB. Por favor comprímala.';
      this.formGroup.patchValue({ firma_mime: null, firma_byte: null });
      this.firmaPreview = null;
      return;
    }

    const dataUrl = await this.fileToDataURL(file); // "data:image/png;base64,AAAA..."
    const base64 = dataUrl.split(',')[1] ?? null;

    this.formGroup.patchValue({
      firma_mime: file.type,
      firma_byte: base64
    });

    this.firmaPreview = dataUrl;
    this.formGroup.get('firma_mime')?.markAsTouched();
    this.formGroup.get('firma_byte')?.markAsTouched();
    this.formGroup.updateValueAndValidity();
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

private buildPreview(mime?: string, base64?: string): string | null {
  if (!mime || !base64) return null;

  const b64 = String(base64).trim();

  // si ya viene como dataURL
  if (b64.startsWith('data:')) return b64;

  return `data:${mime};base64,${b64}`;
}

  closeDialog(value: boolean) {
    this.setRta.emit(value);

    const raw = this.formGroup.getRawValue();

    const payload: AfiCertificateList = {
      id: raw.id ?? undefined,
      tipo_certificado: raw.tipo_certificado ?? undefined,
      encabezado: raw.encabezado ?? undefined,
      textos_fijos: raw.textos_fijos ?? undefined,
      clausulas_legales: raw.clausulas_legales ?? undefined,
      tipo_solicitante: raw.tipo_solicitante ?? undefined,
      texto_justificacion: raw.texto_justificacion ?? undefined,
      nombre_responsable_firma: raw.nombre_responsable_firma ?? undefined,
      cargo_responsable_firma: raw.cargo_responsable_firma ?? undefined,
      firma_mime: raw.firma_mime ?? undefined,
      firma_byte: raw.firma_byte ?? undefined,
    };

    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
