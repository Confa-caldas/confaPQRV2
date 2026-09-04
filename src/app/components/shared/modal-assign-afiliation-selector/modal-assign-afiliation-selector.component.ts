import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RequestsList, UserList } from '../../../models/users.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-assign-afiliation-selector',
  templateUrl: './modal-assign-afiliation-selector.component.html',
  styleUrl: './modal-assign-afiliation-selector.component.scss',
})
export class ModalAssignAfiliationSelectorComponent implements OnInit {
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() parameter = [''];
  @Input() visible: boolean = false;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<any>();
  userList: UserList[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users
  ) {
    this.formGroup = this.formBuilder.group({
      selectedUser: ['', Validators.required],
      mensage: [''],
    });
  }
  ngOnInit(): void {
    this.getUsersTable();
  }

  getUsersTable() {
    this.userService.getUsersListAfiliaciones().subscribe({
      next: (res: BodyResponse<UserList[]>) => {
        this.userList = res.data.filter(s => s.is_active === true);
      },
      error: err => console.log(err),
    });
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const selectedUser = this.formGroup.controls['selectedUser'].value;
    const userName = selectedUser?.user_name || '';
    const userNameCompleted = selectedUser?.user_name_completed || '';
    const mensajeReasignacion = this.formGroup.controls['mensage'].value;
    this.setRtaParameter.emit({ userName, userNameCompleted, mensajeReasignacion });
    this.visible = false;
  }
}