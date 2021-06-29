import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonType, ButtonColor } from './button.interfaces';

@Component({
  selector: 'app-button',
  template: '',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() disabled: boolean;
  @Input() type: ButtonType = 'button';
  @Input() tooltip: string = '';
  @Input() tooltipDelay: number = 0;
  @Input() tooltipPosition: string = 'bottom';
  @Input() color: ButtonColor = 'grey';
  @Input() isError: boolean = false;
  @Output() clicked: EventEmitter<MouseEvent> = new EventEmitter();

  onClick(e: MouseEvent) {
    this.clicked.emit(e);
  }
}
