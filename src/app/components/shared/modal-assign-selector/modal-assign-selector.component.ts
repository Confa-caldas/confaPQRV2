// modal-assign-selector.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { UserList } from '../../../models/users.interface';

export type AssignOrigin = 'GESTOR' | 'AFILIACIONES';

@Component({
  selector: 'app-modal-assign-selector',
  templateUrl: './modal-assign-selector.component.html',
  styleUrl: './modal-assign-selector.component.scss',
})
export class ModalAssignSelectorComponent implements OnInit, OnChanges {
  @Input() origin: AssignOrigin = 'GESTOR';
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() parameter: string[] = [''];
  @Input() visible = false;

  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<{
    userName: string;
    userNameCompleted: string;
    mensajeReasignacion: string;
  }>();

  userList: UserList[] = [];
  formGroup: FormGroup;

  loadingUsers = false;

  constructor(
    private fb: FormBuilder,
    private userService: Users
  ) {
    this.formGroup = this.fb.group({
      // Guardamos el OBJETO completo del usuario (recomendado para tu closeDialog actual)
      selectedUser: [null, Validators.required],
      mensage: [''],
    });
  }

  ngOnInit(): void {
    // Si este modal se crea/destruye con *ngIf, esto se ejecuta cada vez que se abre
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si el origin cambia mientras el componente existe, recarga el listado
    if (changes['origin'] && !changes['origin'].firstChange) {
      this.resetSelection();
      this.loadUsers();
    }

    // Si el modal se muestra/oculta sin destruirse, recarga al abrir
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.resetSelection();
      this.loadUsers();
    }
  }

  private resetSelection(): void {
    this.formGroup.get('selectedUser')?.reset(null, { emitEvent: false });
  }

  private getUsersByOrigin(): Observable<BodyResponse<UserList[]>> {
    // 👉 Asegúrate de implementar estos 2 métodos en tu Users service
    if (this.origin === 'AFILIACIONES') {
      return this.userService.getUsersListAfiliaciones();
    }
    return this.userService.getUsersList();
  }

  private loadUsers(): void {
    this.loadingUsers = true;

    this.getUsersByOrigin().subscribe({
      next: (res: BodyResponse<UserList[]>) => {
        this.userList = (res.data ?? []).filter(u => u.is_active === 1);
      },
      error: (err: any) => console.log(err),
      complete: () => (this.loadingUsers = false),
    });
  }

  showDialog(): void {
    this.visible = true;
    this.resetSelection();
    this.loadUsers();
  }

  closeDialog(value: boolean): void {
    this.setRta.emit(value);

    const selectedUser: UserList | null = this.formGroup.get('selectedUser')?.value ?? null;
    const mensajeReasignacion: string = this.formGroup.get('mensage')?.value ?? '';

    const userName = selectedUser?.user_name ?? '';
    const userNameCompleted = selectedUser?.user_name_completed ?? '';

    this.setRtaParameter.emit({ userName, userNameCompleted, mensajeReasignacion });
    this.visible = false;
  }
}
