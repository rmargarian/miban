import { Component, Input, OnChanges, ElementRef } from '@angular/core';
import * as zxcvbn from 'zxcvbn';

@Component({
  selector: 'app-strength-password',
  templateUrl: './strength-password.component.html',
  styleUrls: ['./strength-password.component.scss']
})
export class StrengthPasswordComponent implements OnChanges {
  @Input() password: String;
  estimation: any;
  strengthText: string[] = ['Weak', 'Weak', 'So-so', 'So-so', 'Great!'];

  constructor(public elementRef: ElementRef) { }

  ngOnChanges() {
    this.getStrength(this.password);
  }

  /**
   * Use zxcvbn library to show approximate time for password hack
   * @param {String} value
   */
  getStrength(value: String) {
    this.estimation = zxcvbn(value || '');
  }
}
