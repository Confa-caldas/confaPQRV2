import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-input',
  templateUrl: './modal-input.component.html',
  styleUrl: './modal-input.component.scss',
})
export class ModalInputComponent implements OnInit {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() parameter = [''];
  @Input() visible: boolean = false;
  @Input() oneField: boolean = false;
  @Input() inputForm: string[] = [];
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<string[]>();
  inputValue1: string = '';
  inputValue2: string = '';
  inputValue: string[] = [''];
  private initialSnapshot1 = '';
  private initialSnapshot2 = '';
  showDialog() {
    this.visible = true;
  }
  formGroup: FormGroup<any> = new FormGroup<any>({});

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      inputValue1: ['', [Validators.required, Validators.pattern('^[^#$%&]+$')]],
      inputValue2: ['', [Validators.required, Validators.pattern('^[^#$%&]+$')]],
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg != 'Crear') {
      this.formGroup.setValue({
        inputValue1: this.inputForm[0] ?? '',
        inputValue2: this.inputForm[1] ?? '',
      });
    } else {
      this.formGroup.reset();
    }
    this.initialSnapshot1 = String(this.formGroup.get('inputValue1')?.value ?? '');
    this.initialSnapshot2 = String(this.formGroup.get('inputValue2')?.value ?? '');
  }

  /** Deshabilita el botón principal si es "Modificar" y no hay cambios respecto al valor inicial. */
  isPrimaryDisabled(): boolean {
    if (this.oneField) {
      const c1 = this.formGroup.get('inputValue1');
      if (!c1?.valid) {
        return true;
      }
      if (this.buttonmsg === 'Modificar' && !this.modifyHasChanges()) {
        return true;
      }
      return false;
    }
    if (!this.formGroup.valid) {
      return true;
    }
    if (this.buttonmsg === 'Modificar' && !this.modifyHasChanges()) {
      return true;
    }
    return false;
  }

  private modifyHasChanges(): boolean {
    const v1 = String(this.formGroup.get('inputValue1')?.value ?? '').trim();
    const v2 = String(this.formGroup.get('inputValue2')?.value ?? '').trim();
    const i1 = String(this.initialSnapshot1 ?? '').trim();
    const i2 = String(this.initialSnapshot2 ?? '').trim();
    if (this.oneField) {
      return v1 !== i1;
    }
    return v1 !== i1 || v2 !== i2;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    if (this.inputForm.length > 0) {
      this.inputValue = [
        this.formGroup.controls['inputValue1'].value,
        this.formGroup.controls['inputValue2'].value,
        this.inputForm[2],
      ];
    } else {
      this.inputValue = [
        this.formGroup.controls['inputValue1'].value,
        this.formGroup.controls['inputValue2'].value,
      ];
    }
    this.setRtaParameter.emit(this.inputValue);
    this.visible = false;
  }
}
