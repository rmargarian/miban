import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { DialogComponent } from '@app/components';
import { User } from '@app/models';

@Component({
  selector: 'app-update-fields',
  templateUrl: './update-fields.component.html',
  styleUrls: ['./update-fields.component.scss']
})
export class UpdateFieldsComponent extends DialogComponent implements OnInit {

  locCount: number = 0;
  dateCount: number = 0;
  date2Count: number = 0;
  groupsCount: number = 0;
  savedCount: number = 0;

  isClearDate2: boolean = false;

  ngOnInit() {
    const length = this.data.users.length;
    this.checkEquals();

    this.form = this.formBuilder.group({
      'p_location': [this.locCount === length ? this.data.users[0].p_location : ''],
      'p_date': [this.dateCount === length ? this.data.users[0].p_date : ''],
      'p_date2': [this.date2Count === length ? this.data.users[0].p_date2 : ''],
      'p_groups': [this.groupsCount === length ? this.data.users[0].p_groups : ''],
      'p_saved': [this.savedCount === length ? this.data.users[0].p_saved : '']
    });
  }

  /**
   * Checks if all users have the same data for each fields.
   */
  private checkEquals() {
    this.data.users.forEach((user: User) => {
      if (user.p_location && user.p_location === this.data.users[0].p_location) { this.locCount++; }
      if (user.p_date && user.p_date === this.data.users[0].p_date) { this.dateCount++; }
      if (user.p_date2 && user.p_date2 === this.data.users[0].p_date2) { this.date2Count++; }
      if (user.p_groups && user.p_groups === this.data.users[0].p_groups) { this.groupsCount++; }
      if (user.p_saved && user.p_saved === this.data.users[0].p_saved) { this.savedCount++; }
    });
  }

  empty(event: any, controlName: string) {
    switch (controlName) {
      case 'date2':
      this.isClearDate2 = event.checked;
      this.getControl('p_date2').enable();
      if (this.isClearDate2) {
        this.getControl('p_date2').disable();
        this.getControl('p_date2').setValue('');
      }
      break;
    }
  }

  save() {
    this.closeDialog({form: this.form.value, isClearDate2: this.isClearDate2});
  }
}
