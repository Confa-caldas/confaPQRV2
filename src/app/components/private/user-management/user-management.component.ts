import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { UpdateUserEmailResult, UserManagementRow, UserManagementSearchFilter } from '../../../models/users.interface';

/** At least one of the two filters is mandatory: with no NIT and no user document there is no way to search. */
const atLeastOneFilterValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const company = (group.get('numero_documento_empresa')?.value || '').toString().trim();
  const user = (group.get('numero_documento_usuario')?.value || '').toString().trim();
  return company || user ? null : { noFilter: true };
};

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  formGroup: FormGroup;
  users: UserManagementRow[] = [];
  searching = false;
  searched = false;

  showEditModal = false;
  selectedUser?: UserManagementRow;

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users,
    private messageService: MessageService
  ) {
    this.formGroup = this.formBuilder.group(
      {
        numero_documento_empresa: [''],
        numero_documento_usuario: [''],
      },
      { validators: atLeastOneFilterValidator }
    );
  }

  get filterErrorMessage(): string {
    if (!this.formGroup.touched) {
      return '';
    }
    return this.formGroup.hasError('noFilter')
      ? 'Debe ingresar el NIT de la empresa o el documento del usuario para buscar'
      : '';
  }

  search(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }

    const filter: UserManagementSearchFilter = {
      numero_documento_empresa: (this.formGroup.controls['numero_documento_empresa'].value || '').toString().trim(),
      numero_documento_usuario: (this.formGroup.controls['numero_documento_usuario'].value || '').toString().trim(),
    };

    this.searching = true;
    this.userService.getUserManagementList(filter).subscribe({
      next: (response: BodyResponse<UserManagementRow[]>) => {
        this.searching = false;
        this.searched = true;
        if (response.code === 200) {
          this.users = response.data || [];
        } else {
          this.users = [];
          this.messageService.add({
            severity: 'error',
            summary: 'No se pudo buscar',
            detail: response.message || 'Operación fallida',
          });
        }
      },
      error: (err: unknown) => {
        this.searching = false;
        this.searched = true;
        this.users = [];
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo conectar con el servicio. Intente nuevamente.',
        });
      },
    });
  }

  clear(): void {
    this.formGroup.reset();
    this.users = [];
    this.searched = false;
  }

  editEmail(user: UserManagementRow): void {
    this.selectedUser = user;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onEmailUpdated(result: UpdateUserEmailResult): void {
    // El mismo id_usuario puede aparecer en varias filas (una por cada empresa a la
    // que pertenece), así que hay que actualizar TODAS, no solo la primera coincidencia.
    this.users
      .filter(u => u.id_usuario === result.id_usuario)
      .forEach(u => (u.correo = result.correo_nuevo));
  }
}
