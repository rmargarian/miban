import { Component, Input, AfterViewInit } from '@angular/core';
import { InputComponent } from '../input.component';

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.scss', '../input.component.scss']
})

export class SelectInputComponent extends InputComponent implements AfterViewInit {

  @Input() options: any;
  @Input() type: any;
  @Input() textField: string;
  @Input() valueField: string;
  @Input() groupBy: any = undefined;
  @Input() groupValue: any = undefined;
  @Input() placeholder: string;
  @Input() searchOn: boolean = true;

  ngAfterViewInit() {
    if (this.focus) {
      setTimeout(() => {
        (<any>this.inputElement).focus();
      });
    }
  }
}
