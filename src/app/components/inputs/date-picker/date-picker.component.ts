import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AbstractControl } from '@angular/forms';
import * as moment from 'moment';

import { InputComponent } from '../input.component';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'DD-MMM-YY',
    monthYearLabel: 'MMM YY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss', '../input.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS},
  ],
})
export class DatePickerComponent extends InputComponent {

  @Input() control: AbstractControl;
  @Input() width: string;
  @Output() clear: EventEmitter<string> = new EventEmitter();

  dateChanged(date: any) {
    this.control.setValue(moment(date.value).format('YYYY-MM-DD'));
  }

  clearDate() {
    this.control.setValue('');
    this.clear.emit('');
  }
}
