import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ActivacionEmpresaConsultaFila,
  ActivacionEmpresaGestionPayload,
} from '../../../models/users.interface';

@Component({
  selector: 'app-modal-gestionar-activacion-empresa',
  templateUrl: './modal-gestionar-activacion-empresa.component.html',
  styleUrl: './modal-gestionar-activacion-empresa.component.scss',
})
export class ModalGestionarActivacionEmpresaComponent implements OnChanges {
  @Input() visible = false;
  @Input() empresa?: ActivacionEmpresaConsultaFila;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<ActivacionEmpresaGestionPayload>();

  dialogVisible = false;
  private cerrandoDesdeAccion = false;

  formGroup = new FormGroup({
    numero_radicado: new FormControl<string | null>(null, [
      Validators.required,
      Validators.minLength(15),
    ]),
    observaciones: new FormControl<string | null>(null),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      this.dialogVisible = !!changes['visible'].currentValue;
      if (changes['visible'].currentValue === true) {
        this.formGroup.reset();
        this.cerrandoDesdeAccion = false;
      }
    }
  }

  onDialogHide(): void {
    this.dialogVisible = false;
    if (!this.cerrandoDesdeAccion) {
      this.setRta.emit(false);
    }
    this.cerrandoDesdeAccion = false;
  }

  closeDialog(confirm: boolean): void {
    this.cerrandoDesdeAccion = true;

    if (!confirm) {
      this.dialogVisible = false;
      this.setRta.emit(false);
      return;
    }

    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.empresa?.id_empresa) {
      this.cerrandoDesdeAccion = false;
      return;
    }

    const payload: ActivacionEmpresaGestionPayload = {
      id_empresa: this.empresa.id_empresa,
      numero_radicado: String(this.formGroup.controls['numero_radicado'].value || '').trim(),
      observaciones: this.formGroup.controls['observaciones'].value || undefined,
    };
    this.dialogVisible = false;
    this.setRta.emit(true);
    this.setRtaParameter.emit(payload);
  }
}
