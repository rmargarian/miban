import { Component, OnInit } from '@angular/core';

import { DialogComponent } from '@app/components';
import { User } from '@app/models';

@Component({
  selector: 'app-result-dialog',
  templateUrl: './result-dialog.component.html',
  styleUrls: ['./result-dialog.component.scss']
})
export class ResultDialogComponent extends DialogComponent implements OnInit {

  insertedUsers: User[] = [];
  updatedUsers: User[] = [];
  exists: number = 0;
  ignored: number = 0;
  logs: string[] = [];

  ngOnInit() {
    this.data.validUsers.forEach(user => {
      if (user.id) { this.updatedUsers.push(user); }
      else { this.insertedUsers.push(user); }
    });

    this.configureLogs();
  }

  /**
   * Configures string array with logs for each user from file except inserted.
   */
  private configureLogs() {
    const existingEmails: string[] = [];
    this.data.users.forEach((user: User) => {
      const obj = this.data.validUsers.find((u: User) => u.email === user.email);
      const exists = existingEmails.find((email: string) => email === user.email);
      existingEmails.push(user.email);
      if (!obj) {
        if (!user.first_name) { this.logs.push('First name is required!'); this.ignored++; }
        else if (!user.last_name) { this.logs.push('Last name is required!'); this.ignored++; }
        else if (!user.email) { this.logs.push('Email is required!'); this.ignored++; }
        else { this.logs.push(`Email: ${user.email} is not valid!`); this.ignored++; }
      } else if (obj && obj.id && !exists) {
        const update = this.logs.find(log => log === `Update user: ${user.email}`);
        if (!update) { this.logs.push(`Update user: ${user.email}`); }
      } else if (exists) {
        this.exists++;
        this.logs.push(`Email: ${user.email} already exists in the list!`);
      }
    });
  }
}
