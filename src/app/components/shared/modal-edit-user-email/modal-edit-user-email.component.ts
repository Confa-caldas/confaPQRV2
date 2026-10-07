import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { UpdateUserEmailPayload, UpdateUserEmailResult, UserManagementRow } from '../../../models/users.interface';

/** Same format pattern the backend Lambda validates, as an extra layer of defense in the frontend. */
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function differentFromCurrentEmailValidator(currentEmail: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const newEmail = (control.value || '').toString().trim().toLowerCase();
    const current = (currentEmail || '').toString().trim().toLowerCase();
    if (!newEmail || !current) {
      return null;
    }
    return newEmail === current ? { sameAsCurrentEmail: true } : null;
  };
}

@Component({
  selector: 'app-modal-edit-user-email',
  templateUrl: './modal-edit-user-email.component.html',
  styleUrl: './modal-edit-user-email.component.scss',
})
export class ModalEditUserEmailComponent implements OnInit {
  @Input() visible = false;
  @Input() user?: UserManagementRow;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() emailUpdated = new EventEmitter<UpdateUserEmailResult>();

  formGroup: FormGroup;
  saving = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users,
    private messageService: MessageService
  ) {
    this.formGroup = this.formBuilder.group({
      correo_nuevo: [
        '',
        [Validators.required, Validators.email, Validators.pattern(EMAIL_REGEX), Validators.maxLength(255)],
      ],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.formGroup
        .get('correo_nuevo')
        ?.addValidators(differentFromCurrentEmailValidator(this.user.correo));
      this.formGroup.get('correo_nuevo')?.updateValueAndValidity();
    }
  }

  emailErrorMessage(): string {
    const control = this.formGroup.get('correo_nuevo');
    if (!control || !control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'El correo nuevo es obligatorio';
    }
    if (control.hasError('email') || control.hasError('pattern')) {
      return 'Ingrese un correo electrónico válido';
    }
    if (control.hasError('sameAsCurrentEmail')) {
      return 'El correo nuevo debe ser diferente al correo actual';
    }
    if (control.hasError('maxlength')) {
      return 'El correo nuevo no puede superar 255 caracteres';
    }
    return '';
  }

  close(value: boolean): void {
    this.visible = false;
    this.setRta.emit(value);
  }

  save(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || !this.user) {
      return;
    }

    const payload: UpdateUserEmailPayload = {
      id_usuario: this.user.id_usuario,
      correo_nuevo: (this.formGroup.controls['correo_nuevo'].value || '').toString().trim(),
    };

    this.saving = true;
    this.userService.updateUserEmail(payload).subscribe({
      next: (response: BodyResponse<UpdateUserEmailResult>) => {
        this.saving = false;
        if (response.code === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Exitoso',
            detail: response.message || 'Correo actualizado correctamente',
          });
          this.emailUpdated.emit(response.data);
          this.close(true);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'No se pudo actualizar el correo',
            detail: response.message || 'Operación fallida',
          });
        }
      },
      error: (err: unknown) => {
        this.saving = false;
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo conectar con el servicio. Intente nuevamente.',
        });
      },
    });
  }
}
