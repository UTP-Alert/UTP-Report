import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <input 
      [class]="getInputClasses()"
      [type]="type"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [value]="value"
      [id]="id"
      [required]="required"
      [aria-label]="ariaLabel"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (focus)="onFocus()" />
  `
})
export class InputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() class = '';
  @Input() id = '';
  @Input() required = false;
  @Input() ariaLabel = '';
  @Output() valueChange = new EventEmitter<string>();

  value = '';
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  getInputClasses(): string {
    return `flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${this.class}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(): void {
    // Handle focus if needed
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}