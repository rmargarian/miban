import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-config-field',
  templateUrl: './configuration-field.component.html',
  styleUrls: ['./configuration-field.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ConfigurationFieldComponent {

  @Input() inputs: any;
  @Input() parentForm: FormGroup;

}
