import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-config-block',
  templateUrl: './configuration-block.component.html',
  styleUrls: ['./configuration-block.component.scss']
})

export class ConfigurationBlockComponent {
  constructor() {
  }

  @Input() header: string;
  @Input() info: string;
}
