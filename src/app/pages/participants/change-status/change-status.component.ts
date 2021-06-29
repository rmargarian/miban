import { Component, OnInit } from '@angular/core';

import { DialogComponent } from '@app/components';
import { Questionnaire } from '@app/models';
import { setAcronym, checkIfNotOneStatusExists } from '@app/utils';

@Component({
  selector: 'app-change-status',
  templateUrl: './change-status.component.html',
  styleUrls: ['./change-status.component.scss']
})
export class ChangeStatusComponent extends DialogComponent implements OnInit {

  questionnaires: Questionnaire[] = [];
  values = [{name: 1}, {name: 2}, {name: 3}];
  statuses = [{value: 1, name: 'open'}, {value: 3, name: 'complete'}];

  ngOnInit() {
    this.data.companyQuests.forEach((value: Questionnaire) => {
      if(checkIfNotOneStatusExists(value.id, this.data.users)) return;
      let acronym = value.abbreviation;
      if (!acronym) acronym = setAcronym(value.title);
      value.abbreviation = acronym;
      this.questionnaires.push(value);
    });

    this.form = this.createGroup();
  }

  createGroup() {
    const group = this.formBuilder.group({});
    this.questionnaires.forEach(control => {
      group.addControl(control.id.toString(), this.formBuilder.group({
        'status': [],
        'limit': [],
        'report': [],
      }));
    });
    return group;
  }

  save() {
    if (this.form.pristine) return;

    const data = [];
    for (const key of Object.keys(this.form.controls)) {
      if (!this.form.controls[key].pristine) {
        data.push({id: key, values: this.form.controls[key].value});
      }
    }

    this.closeDialog(data);
  }
}
