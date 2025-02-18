import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ApplicantTypeList,
  AssociateApplicantRequest,
  RequestTypeList,
  UserList,
  AssociateRequestUser,
} from '../../../models/users.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-manager-selector',
  templateUrl: './modal-manager-selector.component.html',
  styleUrl: './modal-manager-selector.component.scss',
})
export class ModalManagerSelectorComponent implements OnInit {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() parameter = [''];
  @Input() visible: boolean = false;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AssociateRequestUser>();
  applicantTypeList: ApplicantTypeList[] = [];
  requestTypeList: RequestTypeList[] = [];
  userList: UserList[] = [];
  inputValue1: string = '';
  inputValue2: string = '';
  inputValue: string[] = [''];
  isButtonDisabled = true;

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users
  ) {
    this.formGroup = this.formBuilder.group({
      selectedApplicant: ['', Validators.required],
      selectedRequest: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.getRequestTypesList();
    this.getUserList();
  }
  getRequestTypesList() {
    this.userService.getRequestTypesList().subscribe({
      next: (response: BodyResponse<RequestTypeList[]>) => {
        if (response.code === 200) {
          this.requestTypeList = response.data.filter(obj => obj.is_active !== 0);
        } else {
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  getUserList() {
    this.userService.getUsersList().subscribe({
      next: (response: BodyResponse<UserList[]>) => {
        if (response.code === 200) {
          this.userList = response.data;
          this.userList.forEach(item => {
            item.is_active = item.is_active === 1 ? true : false;
          });
        } else {
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }
  //userForm: FormGroup;
  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    this.inputValue = [this.inputValue1, this.inputValue2];
    const payload: AssociateRequestUser = {
      request_type_id: this.formGroup.controls['selectedApplicant'].value['request_type_id'],
      user_id: this.formGroup.controls['selectedRequest'].value['user_id'],
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
  updateButtonState() {
    this.isButtonDisabled =
      !this.formGroup.get('selectedApplicant')?.value ||
      !this.formGroup.get('selectedRequest')?.value;
  }
}
