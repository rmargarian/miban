import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, delay, takeUntil } from 'rxjs/operators';
import { Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

declare var $: any;

import * as enums from '../../../../../app/enums/enums';
import { DialogComponent } from '@app/components';
import { Questionnaire, CountryState, Keys, Admin, Attempt } from '@app/models';
import { Countries, QuestionnaireType } from '@app/enums';
import { ConfirmationDialogComponent } from '@app/components';
import { nameRegex, emailRegex } from '@app/contants';
import { setAcronym, getMd5Value } from '@app/utils';

@Component({
  selector: 'app-add-participant-dialog',
  templateUrl: './add-participant-dialog.component.html',
  styleUrls: ['./add-participant-dialog.component.scss']
})
export class AddParticipantDialogComponent extends DialogComponent implements OnInit, OnDestroy {

  countryId: number = 0;
  filteredStates: CountryState[] = [];
  validating = false;
  companyId: number;
  key: Keys = {} as Keys;
  urls: {acronym, url, disabled}[] = [];
  user_url: string = '';
  showInfoBox: boolean = false;
  ctrlPressed: boolean = false;
  isSuperAdmin: boolean = false;
  isAdminUrls: boolean = false;
  admin_token: string = '';
  showValidation: boolean = false;

  private destroySubject$: Subject<void> = new Subject();

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(event: KeyboardEvent) {
    this.ctrlPressed = false;
  }

  ngOnInit() {
    this.dialogRef.backdropClick().subscribe(_ => {
      if (!this.data.disableClose)
        this.onClose();
    });
    this.dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.keyCode === this.keyCodes.ESCAPE) {
        event.preventDefault();
        this.onClose();
      }
      this.ctrlPressed = event.keyCode === this.keyCodes.CTRL ? true : false;
    });

    if (!this.data.user) {
      this.data.user = {};
    }
    this.user_url = this.dataService.getUserUrl();
    this.companyId = this.data.companyId;

    this.form = this.formBuilder.group({
      'first_name': [this.data.user.first_name || '', [Validators.required, Validators.pattern(nameRegex)]],
      'last_name': [this.data.user.last_name || '', [Validators.required, Validators.pattern(nameRegex)]],
      'email': [this.data.user.email || '', [Validators.required,
        Validators.pattern(emailRegex)], this.validateEmailNotTaken.bind(this)],
      'company_id': [this.companyId || '', [Validators.required]],
      'passwd': [this.data.user.passwd || ''],
      'career_category_id': [this.data.user.career_category_id || ''],
      'industry_sector': [this.data.user.industry_sector || ''],
      'job_title': [this.data.user.job_title || ''],
      'department': [this.data.user.department || ''],
      'manager_name': [this.data.user.manager_name || ''],
      'training_course_id': [this.data.user.training_course_id || ''],
      'country_id': [this.data.user.country_id || ''],
      'state_name': [this.data.user.state_name || ''],
      'city': [this.data.user.city || ''],
      'currency_id': [this.data.user.currency_id || ''],
      'p_location': [this.data.user.p_location || ''],
      'p_date': [this.data.user.p_date || ''],
      'p_date2': [this.data.user.p_date2 || ''],
      'p_groups': [this.data.user.p_groups || ''],
      'p_saved': [this.data.user.p_saved || ''],
      'notes': [this.data.user.notes || '']
    });

    this.countryId = this.data.user.country_id;
    this.findKey();
    this.updateStates();
    //this.setValidatorsByKey();
    this.setDisabled();

    this.getControl('country_id').valueChanges.subscribe(value => {
      this.changeCurrencyByCountry(value);
      this.countryId = value;
      this.updateStates();
    });

    this.getControl('company_id').valueChanges.subscribe(value => {
      this.companyId = value;
      this.findKey();
     // this.setValidatorsByKey();
      this.setDisabled();
    });
    this.urls = this.genarateAcronymsList();

    const userDetails = this.authenticationService.getUserDetails();
    this.adminService.getAdminById(userDetails.id)
    .subscribe((admin: Admin) => {
      this.isSuperAdmin = admin.is_super;
    });
    this.admin_token = getMd5Value(userDetails.exp.toString());
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  /**
   * Finds Key in Keys array by key id (if selected)
   */
  private findKey() {
    if (!this.companyId) {
      this.key = {} as Keys;
      return;
    }

    for (const key of this.data.keys) {
      if (key.id === this.companyId) {
        this.key = key;
        break;
      }
    }
  }

  /**
   * Returns array with objects:
   * {acronym: Questionnaire's (activated for current key) acronym,
   * url: configured 'auth' url}
   */
  private genarateAcronymsList (): {acronym, url, disabled}[] {
    const urls: {acronym, url, disabled}[] = [];
    if (!this.data.user.id) { return urls; }

    this.data.companyQuests.forEach((value: Questionnaire) => {
      const routes = enums.Routes;
      let route: string = '';
      switch (value.type) {
        case QuestionnaireType.PROFILE:
          route = routes.PROFILES;
          break;
        case QuestionnaireType.ASSESSMENT:
          route = routes.ASSESSMENTS;
          break;
        case QuestionnaireType.FEEDBACK:
          route = routes.FEEDBACK;
          break;
      }
      let acronym = value.abbreviation;
      if (!acronym) {
        acronym = setAcronym(value.title);
      }
      const path = this.isAdminUrls ? 'start' : 'auth';
      let url = this.user_url + route + `/${path}/${this.companyId}-${value.id}-${this.data.user.id}`;
      let disabled = false;
      if (this.isAdminUrls) {
        url += `-${this.admin_token}`;
        const obj = this.data.user.attempts.find((attempt: Attempt) => attempt.questionnaire_id === value.id);
        if (!obj) {
          disabled = true;
          url = '';
        }
      }
      urls.push({acronym: acronym, url: url, disabled: disabled});
    });
    return urls;
  }

  changeCurrencyByCountry(value: number) {
    for (let i = 0; i < this.data.countries.length; i++) {
      if (this.data.countries[i].id === value) {
        this.form.get('currency_id').setValue(this.data.countries[i].currency_id);
        break;
      }
    }
  }

  /**
   * Validates email is not taken.
   * And allows (in 'edit' case) to leave the same email.
   */
  validateEmailNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    if (!this.form) {
      return new Observable(null);
    }

    const oldEmail = this.data.user.email ? this.data.user.email.trim() : '';
    const newEmail = control.value.trim();

    this.validating = true;
    return this.dataService.isUserEmailValid(newEmail)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;

          const sameEmail = (oldEmail === newEmail) ? true : false;
          let resp;
          if (oldEmail) {
            resp = (sameEmail || res) ? null : {emailTaken: true};
          } else {
            resp = (res) ? null : {emailTaken: true};
          }
          return resp;
        }));
  }

  updateStates() {
    if (this.countryId === Countries.AUSTRALIA || this.countryId === Countries.UNITED_STATES) {
      this.filteredStates = this.data.states.filter(obj => obj.country_id === this.countryId);
      this.filteredStates = this.filteredStates.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  /**
   * Method checks 'key' settings and
   * set controls to required or not
   * @param companyId (Key id)
   */
  private setValidatorsByKey() {
    const company: Keys = this.key;

    if (company.mn_career_category) {
      this.form.controls['career_category_id'].setValidators([Validators.required]);
    } else {
      this.form.controls['career_category_id'].clearValidators();
    }
    this.form.get('career_category_id').updateValueAndValidity();

    if (company.mn_city) {
      this.form.controls['city'].setValidators([Validators.required]);
    } else {
      this.form.controls['city'].clearValidators();
    }
    this.form.get('city').updateValueAndValidity();

    if (company.mn_country) {
      this.form.controls['country_id'].setValidators([Validators.required]);
    } else {
      this.form.controls['country_id'].clearValidators();
    }
    this.form.get('country_id').updateValueAndValidity();

    if (company.mn_dept) {
      this.form.controls['department'].setValidators([Validators.required]);
    } else {
      this.form.controls['department'].clearValidators();
    }
    this.form.get('department').updateValueAndValidity();

    if (company.mn_industry_sector) {
      this.form.controls['industry_sector'].setValidators([Validators.required]);
    } else {
      this.form.controls['industry_sector'].clearValidators();
    }
    this.form.get('industry_sector').updateValueAndValidity();

    if (company.mn_job_title) {
      this.form.controls['job_title'].setValidators([Validators.required]);
    } else {
      this.form.controls['job_title'].clearValidators();
    }
    this.form.get('job_title').updateValueAndValidity();

    if (company.mn_manager_name) {
      this.form.controls['manager_name'].setValidators([Validators.required]);
    } else {
      this.form.controls['manager_name'].clearValidators();
    }
    this.form.get('manager_name').updateValueAndValidity();

    if (company.mn_state) {
      this.form.controls['state_name'].setValidators([Validators.required]);
    } else {
      this.form.controls['state_name'].clearValidators();
    }
    this.form.get('state_name').updateValueAndValidity();

    if (company.mn_training_cource) {
      this.form.controls['training_course_id'].setValidators([Validators.required]);
    } else {
      this.form.controls['training_course_id'].clearValidators();
    }
    this.form.get('training_course_id').updateValueAndValidity();
  }

  /**
   * Method checks 'key' settings and
   * set controls (select and date inputs) to 'disable' / 'enable'
   */
  private setDisabled() {
    const company = this.key;

    if (company.edit_career_category) {
      this.form.controls['career_category_id'].enable();
    } else {
      this.form.controls['career_category_id'].disable();
    }
    if (company.edit_training_cource) {
      this.form.controls['training_course_id'].enable();
    } else {
      this.form.controls['training_course_id'].disable();
    }
    if (company.edit_country) {
      this.form.controls['country_id'].enable();
    } else {
      this.form.controls['country_id'].disable();
    }
    if (company.edit_state) {
      this.form.controls['state_name'].enable();
    } else {
      this.form.controls['state_name'].disable();
    }
  }

  save() {
    this.showValidation = true;
    if (this.form.invalid || this.validating) { return; }

    const user = this.form.value;
    user.email = user.email.trim();
    user.id = this.data.user.id;
    this.closeDialog(user);
  }

  /**
   * Shows and hides message box
   * Opens url in new tab if Ctrl pressed
   */
  copyUrlClicked(url) {
    if (this.isAdminUrls && url.disabled) {
      return;
    }
    if (this.ctrlPressed) {
      window.open(url.url, '_blank');
      return;
    }
    const box = $('#box');
    box.removeClass('hidden');
    box.removeClass('visuallyhidden');
    setTimeout(function () {
      box.addClass('visuallyhidden');
      box.one('transitionend', function(e) {
        box.addClass('hidden');
      });
    }, 20);
  }

  /**
   * Opens url in new tab
   */
  mouseUpUrl($event, url) {
    if (this.isAdminUrls && url.disabled) {
      return;
    }
    if ($event.which === 2) {
      window.open(url.url, '_blank');
    }
  }

  mouseDownUrl($event) {
    if ($event.which === 2) {
      $event.preventDefault();
    }
  }

  adminUrlsClicked($event) {
    this.isAdminUrls = $event.checked;
    this.urls = this.genarateAcronymsList();
  }

  onClose() {
    if (!this.form.pristine) {
      const dialogRef = this.openConfirmationDialog();
      dialogRef.afterClosed()
        .pipe(takeUntil(this.destroySubject$))
        .subscribe((data: any) => {
          if (data) {
            this.closeDialog(null);
          }
        });
    } else {
      this.closeDialog(null);
    }
  }

  private openConfirmationDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '530px',
      data: {
        title: 'Confirmation Close',
        text: 'You have some unsaved changes. Are you sure you want to close the editor?'
      }
    });
  }
}
