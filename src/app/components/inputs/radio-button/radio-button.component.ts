import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss']
})
export class RadioButtonComponent {
  @Input() option: any;
  @Input() disabled: boolean = false;
  @Input() textField: string = 'title';
  @Input() valueField: string = 'id';
  @Output() change: EventEmitter<boolean> = new EventEmitter();

  onChange() {
    if (this.isOnChangeFlow()) {
      this.change.emit(true);
    }
  }

  isOnChangeFlow(): boolean {
    return this.change.observers.length > 0;
  }
}
