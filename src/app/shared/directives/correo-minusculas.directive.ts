import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Normaliza correos a minúsculas al perder foco. */
@Directive({
  selector: 'input[type="email"]',
  standalone: true,
})
export class CorreoMinusculasDirective {
  constructor(
    @Optional() private ngControl: NgControl,
    private el: ElementRef<HTMLInputElement>
  ) {}

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement;
    const valor = this.ngControl?.value ?? input.value ?? '';
    const normalizado = (valor || '').toString().trim().toLowerCase();
    if (normalizado !== valor) {
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(normalizado, { emitEvent: false });
      } else {
        input.value = normalizado;
      }
    }
  }
}
