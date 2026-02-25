import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AttachmentTypeList, CategoryList, DepartmentList, ModalityList, MunicipalityList, RelationshipList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';


@Component({
  selector: 'app-modal-relationship',
  templateUrl: './modal-relationship.component.html',
  styleUrl: './modal-relationship.component.scss'
})
export class ModalRelationshipComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() relationshipForm?: RelationshipList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<RelationshipList>();

  inputValue: string[] = [''];
  relationshipList!: RelationshipList[];
  attachmentList!: AttachmentTypeList[];
  checkedMap: Record<number, boolean> = {};
  selectedAdjuntos: number[] = [];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      parentesco: new FormControl(null, [Validators.required]),
      parentesco_genesys: new FormControl(null, [Validators.required]),

      adjuntos_ids: new FormArray([], [Validators.required]),
    });
  }

  get adjuntosIdsFA(): FormArray {
    return this.formGroup.get('adjuntos_ids') as FormArray;
  }


ngOnInit(): void {
  this.getAttachmentTable();
}

syncAdjuntosFA(markTouched: boolean = true) {
  this.adjuntosIdsFA.clear();
  (this.selectedAdjuntos ?? []).forEach(id => this.adjuntosIdsFA.push(new FormControl(id)));

  if (markTouched) this.adjuntosIdsFA.markAsTouched();
  this.adjuntosIdsFA.updateValueAndValidity();
}



toggleAdjunto(id: number, checked: boolean) {
  const fa = this.adjuntosIdsFA;
  const values: number[] = (fa.value ?? []).map((x: any) => Number(x));

  if (checked) {
    if (!values.includes(id)) fa.push(new FormControl(id));
  } else {
    const idx = values.findIndex(x => x === id);
    if (idx >= 0) fa.removeAt(idx);
  }

  fa.markAsTouched();
  fa.updateValueAndValidity();
}



isAdjuntoChecked(id: number): boolean {
  const values: number[] = (this.adjuntosIdsFA.value ?? []).map((x: any) => Number(x));
  return values.includes(id);
}




  formGroup: FormGroup<any> = new FormGroup<any>({});

  showDialog() {
    this.visible = true;
  }

getAttachmentTable() {
  this.userService.getAttachmentList().subscribe({
    next: (response: BodyResponse<AttachmentTypeList[]>) => {
      if (response.code === 200) {
        this.attachmentList = response.data ?? [];

        if (this.buttonmsg !== 'Crear' && this.relationshipForm) {
          this.formGroup.patchValue({
            id: this.relationshipForm.id ?? null,
            parentesco: this.relationshipForm.parentesco ?? null,
            parentesco_genesys: this.relationshipForm.parentesco_genesys ?? null,
          });

          this.selectedAdjuntos = (this.relationshipForm.adjuntos ?? [])
            .map(a => a.id)
            .filter((id): id is number => typeof id === 'number');

          this.syncAdjuntosFA(); // sincroniza el FormArray con selectedAdjuntos
        } else {
          this.formGroup.reset();
          this.selectedAdjuntos = [];
          this.adjuntosIdsFA.clear();
        }
      }
    },
    error: (err: any) => console.log(err),
  });
}


closeDialog(value: boolean) {
  this.setRta.emit(value);

  const raw = this.formGroup.getRawValue();

  const payload: RelationshipList = {
    id: raw.id ?? undefined,
    parentesco: raw.parentesco!,
    parentesco_genesys: raw.parentesco_genesys!,

    adjuntos_ids: this.selectedAdjuntos ?? [],
  };

  this.setRtaParameter.emit(payload);
  this.visible = false;
}

}
