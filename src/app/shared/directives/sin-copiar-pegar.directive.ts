import { Directive, HostListener } from '@angular/core';

/** Impide copiar/pegar en campos de confirmación (celular, correo, cuenta, etc.). */
@Directive({
  selector: '[appSinCopiarPegar]',
  standalone: true,
})
export class SinCopiarPegarDirective {
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent): void {
    event.preventDefault();
  }

  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent): void {
    event.preventDefault();
  }
}
