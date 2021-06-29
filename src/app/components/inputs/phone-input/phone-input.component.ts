import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { InputComponent } from '../input.component';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss']
})
export class PhoneInputComponent extends InputComponent implements OnInit {
  @Input() countriesControl: FormControl = new FormControl();
  @Input() countries: any[] = [];

  ngOnInit() {
  }

  numericKeyDown($event) {
    if (!(/[0-9]/).test($event.key) && $event.keyCode !== 8) {
      $event.preventDefault();
    }
  }

}
