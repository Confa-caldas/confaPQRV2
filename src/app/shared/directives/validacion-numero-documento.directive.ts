import { Directive, DoCheck, Input, OnDestroy, Optional } from '@angular/core';
import { AbstractControl, NgControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TipoDocumentoConReglas } from '../models/tipo-documento-con-reglas';

export function validarNumeroDocumento(reglas: TipoDocumentoConReglas | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    if (!value) {
      return null;
    }
    if (!reglas) {
      return null;
    }

    const { digitosMinimos, digitosMaximos, permiteLetras, cantidadLetras } = reglas;
    const len = value.length;

    if (len < digitosMinimos) {
      return {
        numeroDocumentoMinimo: {
          required: digitosMinimos,
          actual: len,
          message: `El número de documento debe tener al menos ${digitosMinimos} caracteres.`,
        },
      };
    }

    if (len > digitosMaximos) {
      return {
        numeroDocumentoMaximo: {
          required: digitosMaximos,
          actual: len,
          message: `El número de documento no puede superar ${digitosMaximos} caracteres.`,
        },
      };
    }

    if (!permiteLetras) {
      if (!/^\d+$/.test(value)) {
        return {
          numeroDocumentoSoloNumeros: true,
          message: 'El número de documento solo puede contener dígitos.',
        };
      }
      return null;
    }

    if (!/^[A-Za-z0-9]+$/.test(value)) {
      return {
        numeroDocumentoAlfanumerico: true,
        message: 'El número de documento solo puede contener números y letras.',
      };
    }

    if (cantidadLetras != null && cantidadLetras !== undefined) {
      const numLetras = (value.match(/[A-Za-z]/g) || []).length;
      if (numLetras > cantidadLetras) {
        return {
          numeroDocumentoMaximoLetras: {
            required: cantidadLetras,
            actual: numLetras,
            message: `El número de documento puede tener como máximo ${cantidadLetras} letra(s).`,
          },
        };
      }
    }

    return null;
  };
}

@Directive({
  selector: '[appValidacionNumeroDocumento]',
  standalone: true,
})
export class ValidacionNumeroDocumentoDirective implements DoCheck, OnDestroy {
  @Input() appValidacionNumeroDocumento: TipoDocumentoConReglas | null = null;

  private readonly validatorFn: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
    validarNumeroDocumento(this.appValidacionNumeroDocumento)(control);

  private validatorAttached = false;
  private lastReglasKey = '';

  constructor(@Optional() private ngControl: NgControl) {}

  ngDoCheck(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }

    if (!this.validatorAttached) {
      control.addValidators(this.validatorFn);
      this.validatorAttached = true;
      this.lastReglasKey = this.claveReglas(this.appValidacionNumeroDocumento);
      control.updateValueAndValidity({ emitEvent: false });
      return;
    }

    const key = this.claveReglas(this.appValidacionNumeroDocumento);
    if (key !== this.lastReglasKey) {
      this.lastReglasKey = key;
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    const control = this.ngControl?.control;
    if (control && this.validatorAttached) {
      control.removeValidators(this.validatorFn);
      this.validatorAttached = false;
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private claveReglas(r: TipoDocumentoConReglas | null): string {
    if (!r) {
      return '__sin_tipo__';
    }
    return [r.value, r.digitosMinimos, r.digitosMaximos, r.permiteLetras, r.cantidadLetras ?? ''].join('|');
  }
}
