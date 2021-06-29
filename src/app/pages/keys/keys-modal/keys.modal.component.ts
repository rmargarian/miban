import { Component, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { DialogComponent } from '@app/components';
import { delay, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { CountryState } from '@app/models';
import { Countries } from '@app/enums';
import { emailRegex } from '@app/contants';

declare function setCloneSuffix(field, count, postfix): any;

@Component({
  selector: 'app-keys-modal',
  templateUrl: './keys.modal.component.html',
  styleUrls: ['./keys.modal.component.scss', '../../../components/dialog/dialog.component.scss']
})
export class KeysModalComponent extends DialogComponent implements OnInit {
  public people: any;
  public placeholder: string = ' ';
  countryId: number = 0;
  validating: boolean = false;
  filteredStates: CountryState[] = [];
  showValidation: boolean = false;

  ngOnInit() {

    if (!this.data.key) {
      this.data.key = {};
    }

    const profilesIds = [], assessmentsIds = [], feedbacksIds = [], questionnaires = [];
    if (this.data.key['company-questionnaire-maps']) {
      for (let i = 0; i < this.data.key['company-questionnaire-maps'].length; i++) {
        if (this.data.key['company-questionnaire-maps'][i].questionnaire) {
          questionnaires.push(this.data.key['company-questionnaire-maps'][i].questionnaire);
        }
      }

      questionnaires.forEach(questionnaire => {
        switch (questionnaire.type) {
          case 1:
            assessmentsIds.push(questionnaire.id);
            break;
          case 2:
            profilesIds.push(questionnaire.id);
            break;
          case 3:
            feedbacksIds.push(questionnaire.id);
            break;
        }
      });
    }

    if (this.data.type === 'add') {
      this.selectDefaultCheckboxes();
      this.data.key.admin_email = 'calum.coburn@negotiations.com';
    }

    this.form = this.formBuilder.group({
      'company_key': [this.data.key.company_key, [Validators.required], this.validateCompanyKeyNotTaken.bind(this)],
      'title': [this.data.key.title, [Validators.required], this.validateCompanyTitleNotTaken.bind(this)],
      'reports_pass': [this.data.key.reports_pass, []],
      'admin': [this.data.key.admin ? this.data.key.admin : 'Calum Coburn', []],
      'admin_email': [this.data.key.admin_email ? this.transformAdminEmail(this.data.key.admin_email) : this.data.key.admin_email,
        [Validators.required]],
      'sponsor_name': [this.data.key.sponsor_name, []],
      'industry_sector': [this.data.key.industry_sector, []],
      'edit_industry_sector': [this.data.key.edit_industry_sector, []],
      'show_industry_sector': [this.data.key.show_industry_sector, []],
      'mn_industry_sector': [this.data.key.mn_industry_sector, []],
      'c_category': [this.data.key.c_category, []],
      'edit_career_category': [this.data.key.edit_career_category, []],
      'show_career_category': [this.data.key.show_career_category, []],
      'mn_career_category': [this.data.key.mn_career_category, []],
      'training_date': [this.data.key.training_date || '', []],
      'show_training_date': [this.data.key.show_training_date, []],
      'mn_training_date': [this.data.key.mn_training_date, []],
      'training_course_id': [this.data.key.training_course_id],
      'edit_training_cource': [this.data.key.edit_training_cource, []],
      'show_training_cource': [this.data.key.show_training_cource, []],
      'mn_training_cource': [this.data.key.mn_training_cource, []],
      'country_id': [this.data.key.country_id, []],
      'edit_country': [this.data.key.edit_country, []],
      'show_country': [this.data.key.show_country, []],
      'mn_country': [this.data.key.mn_country, []],
      'state_name': [this.data.key.state_name, []],
      'edit_state': [this.data.key.edit_state, []],
      'show_state': [this.data.key.show_state, []],
      'mn_state': [this.data.key.mn_state, []],
      'city': [this.data.key.city, []],
      'edit_city': [this.data.key.edit_city, []],
      'show_city': [this.data.key.show_city, []],
      'mn_city': [this.data.key.mn_city, []],
      'department': [this.data.key.department, []],
      'edit_dept': [this.data.key.edit_dept, []],
      'show_dept': [this.data.key.show_dept, []],
      'mn_dept': [this.data.key.mn_dept, []],
      'job_title': [this.data.key.job_title, []],
      'edit_job_title': [this.data.key.edit_job_title, []],
      'show_job_title': [this.data.key.show_job_title, []],
      'mn_job_title': [this.data.key.mn_job_title, []],
      'manager_name': [this.data.key.manager_name, []],
      'edit_manager_name': [this.data.key.edit_manager_name, []],
      'show_manager_name': [this.data.key.show_manager_name, []],
      'mn_manager_name': [this.data.key.mn_manager_name, []],
      'fe_currency_id': [this.data.key.fe_currency_id],
      'email': [this.data.key.email, [Validators.pattern(emailRegex)]],
      'currency_id': [this.data.key.Currency ? this.data.key.Currency.id : '', [Validators.required]],
      'profiles': [profilesIds],
      'assessments': [assessmentsIds],
      'feedbacks': [feedbacksIds],
    });

    this.countryId = this.data.key.country_id;
    this.setValidators();
    this.getControl('country_id').valueChanges.subscribe(value => {
      this.changeCurrencyByCountry(value);
      this.countryId = value;
      this.setValidators();
    });

    const prefixedControls = this.cutControlsWithPrefix();

    prefixedControls.forEach(controlName => {
      this.getControl(controlName).valueChanges.subscribe(value => {
        this.checkFirstPrefixLetter(controlName, value);
      });
    });

    if (this.data.type === 'clone') {
      this.setClonePostfix();
    }

  }

  transformAdminEmail(adminEmail: string) {
    return adminEmail.indexOf('@') !== -1 ? adminEmail.split('@')[0] : '';
  }

  private setClonePostfix() {

    this.keyService.getFieldUniqueCloneCount('company_key', this.data.key.company_key)
      .subscribe((count: number) => {
        this.getControl('company_key').setValue(setCloneSuffix(this.data.key.company_key, count, ' - Clone'));
      });

    this.keyService.getFieldUniqueCloneCount('title', this.data.key.title)
      .subscribe((count: number) => {
        this.getControl('title').setValue(setCloneSuffix(this.data.key.title, count, ' - Clone'));
      });
  }


  private checkFirstPrefixLetter(controlName: string, value: boolean) {
    switch (controlName.slice(0, 1)) {
      case 'e' :
        this.editHandler(controlName, value);
        break;
      case 's' :
        this.showHandler(controlName, value);
        break;
      case 'm' :
        this.mnHandler(controlName, value);
        break;
    }
  }

  /**
   * Handlers for the right checkboxes selection logic
   */
  private editHandler(controlName: string, value: boolean) {
    const mainControlName = this.getMainNameOfEntireControlName(controlName);
    if (value === true) {
      this.form.get('show_' + mainControlName[1]).setValue(true, {emitEvent: false});
    }
    if (value === false) {
      if (this.form.get('mn_' + mainControlName[1]).value === true) {
        this.form.get('mn_' + mainControlName[1]).setValue(false, {emitEvent: false});
      }
    }
  }

  private showHandler(controlName: string, value: boolean) {
    const mainControlName = this.getMainNameOfEntireControlName(controlName);
    if (value === false) {
      if (this.form.get('mn_' + mainControlName[1]).value === true) {
        this.form.get('mn_' + mainControlName[1]).setValue(false, {emitEvent: false});
      }
      if (this.form.get('edit_' + mainControlName[1])) {
        this.form.get('edit_' + mainControlName[1]).setValue(false, {emitEvent: false});
      }
    }
  }

  private mnHandler(controlName: string, value: boolean) {
    const mainControlName = this.getMainNameOfEntireControlName(controlName);
    if (value === true) {
      if (this.form.get('edit_' + mainControlName[1])) {
        this.form.get('edit_' + mainControlName[1]).setValue(true, {emitEvent: false});
      }
      this.form.get('show_' + mainControlName[1]).setValue(true, {emitEvent: false});
      this.replaceCheckboxes(mainControlName[1]);
    }

  }

  private replaceCheckboxes(control: string) {
    const editCheckbox = this.form.get('edit_' + control);
    const showCheckbox = this.form.get('show_' + control);
    editCheckbox.setValue(showCheckbox.value);
    showCheckbox.setValue(editCheckbox.value);
  }

  private getMainNameOfEntireControlName(controlName: string): any[] {
    const mainName = controlName.split('_');
    return [mainName.shift(), mainName.join('_')];
  }

  private cutControlsWithPrefix(): any[] {
    const controlsWithPrefixes = [];
    for (const control in this.form.controls) {
      if (this.isPrefixedKey(control, ['edit', 'show', 'mn'])) {
        controlsWithPrefixes.push(control);
      }
    }
    return controlsWithPrefixes;
  }

  private isPrefixedKey(key: string, prefixes: string[]) {
    for (let i = 0; i < prefixes.length; i++) {
      if (key.indexOf(prefixes[i]) > -1) {
        return true;
      }
    }
    return;
  }

  private selectDefaultCheckboxes() {
    this.data.key.show_training_date = true;
    this.data.key.show_training_cource = true;
    this.data.key.edit_country = true;
    this.data.key.show_country = true;
    this.data.key.mn_country = true;
    this.data.key.edit_state = true;
    this.data.key.show_state = true;
    this.data.key.edit_dept = true;
    this.data.key.show_dept = true;
    this.data.key.edit_job_title = true;
    this.data.key.show_job_title = true;
    this.data.key.edit_manager_name = true;
    this.data.key.show_manager_name = true;
  }

  private setValidators() {
    if (this.countryId === Countries.AUSTRALIA || this.countryId === Countries.UNITED_STATES) {
      this.filteredStates = this.data.states.filter(obj => obj.country_id === this.countryId);
      this.filteredStates = this.filteredStates.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  changeCurrencyByCountry(value: number) {
    for (let i = 0; i < this.data.countries.length; i++) {
      if (this.data.countries[i].id === value) {
        this.form.get('currency_id').setValue(this.data.countries[i].currency_id);
        break;
      }
    }
  }

  private validateCompanyKeyNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    this.validating = true;
    return this.validationService.isCompanyKeyValid(control.value)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;
          const sameKeyName = (this.data.key.company_key === control.value && this.data.type !== 'clone') ? true : false;
          let resp;
          if (this.data.key.company_key) {
            resp = (sameKeyName || res) ? null : {companyKeyTaken: true};
          } else {
            resp = (res) ? null : {companyKeyTaken: true};
          }
          return resp;
        }));
  }

  private validateCompanyTitleNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    this.validating = true;
    return this.validationService.isCompanyTitleValid(control.value)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;
          const sameKeyTitle = (this.data.key.title === control.value && this.data.type !== 'clone') ? true : false;
          let resp;
          if (this.data.key.title) {
            resp = (sameKeyTitle || res) ? null : {companyTitleTaken: true};
          } else {
            resp = (res) ? null : {companyTitleTaken: true};
          }
          return resp;
        }));
  }

  save() {
    this.showValidation = true;
    if (this.form.invalid || this.validating) { return; }
    
    this.form.value.id = this.data.key.id;
    this.form.value.email = this.form.value.email ? this.form.value.email.trim() : this.form.value.email;

    let adminEmail = this.form.value.admin_email ? this.form.value.admin_email.trim() : this.form.value.admin_email;
    adminEmail = adminEmail ? (adminEmail + '@negotiations.com') : '';
    this.form.value.admin_email = adminEmail;

    this.closeDialog(this.form.value);
  }
}
