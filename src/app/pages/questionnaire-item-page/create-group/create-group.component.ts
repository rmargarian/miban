import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/components';
import {
  Validators} from '@angular/forms';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent extends DialogComponent implements OnInit {

  ngOnInit() {

    if (!this.data.group) {
      this.data.group = {};
    }

    this.form = this.formBuilder.group({
      'title': [this.data.group.title || '', [Validators.required]],
      'description': [this.data.group.description || ''],
      'is_active': [this.data.group.is_active || '']
    });
  }

  save() {
    this.closeDialog(this.form.value);
  }

}
