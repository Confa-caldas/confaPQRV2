import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RequestsList, UserList } from '../../../models/users.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-review-state',
  templateUrl: './modal-review-state.component.html',
  styleUrl: './modal-review-state.component.scss',
})
export class ModalReviewStateComponent implements OnInit {
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
      // selectedUser: ['', Validators.required],
      mensage: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    console.log('');
  }

  // getUsersTable() {
  //   this.userService.getUsersList().subscribe({
  //     next: (response: BodyResponse<UserList[]>) => {
  //       if (response.code === 200) {
  //         this.userList = response.data;
  //         this.userList.forEach(item => {
  //           item.is_active = item.is_active === 1 ? true : false;
  //         });
  //       } else {
  //       }
  //     },
  //     error: (err: any) => {
  //       console.log(err);
  //     },
  //     complete: () => {
  //       console.log('La suscripción ha sido completada.');
  //     },
  //   });
  // }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const mensssajeReview = this.formGroup.controls['mensage'].value;
    this.setRtaParameter.emit({ mensssajeReview });
    this.visible = false;
  }
}
