import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-radio-buttons-group',
  templateUrl: './radio-buttons-group.component.html',
  styleUrls: ['./radio-buttons-group.component.scss']
})
export class RadioButtonsGroupComponent {
  @Input() items: any[];
  @Input() textField: string = 'title';
  @Input() valueField: string = 'id';
}
