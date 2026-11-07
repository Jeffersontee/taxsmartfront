import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { formatPhone } from '../utils/phone-mask.util';

@Directive({
  selector: '[appPhoneMask]',
  standalone: true,
})
export class PhoneMaskDirective {
  private ngControl = inject(NgControl, { optional: true });

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    const formatted = formatPhone(input.value);
    input.value = formatted;

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(formatted, { emitEvent: false });
    }
  }

  @HostListener('ionInput', ['$event'])
  onIonInput(event: any): void {
    const rawVal = event?.detail?.value ?? '';
    const formatted = formatPhone(rawVal);

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(formatted, { emitEvent: false });
    }
  }
}
