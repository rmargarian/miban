import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, delay, takeUntil } from 'rxjs/operators';
import { Validators, FormBuilder } from '@angular/forms';
import {
  AbstractControl,
  FormControl,
  ValidationErrors
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ReCaptchaV3Service } from 'ng-recaptcha';

import * as countryTelData from 'country-telephone-data';

import { User } from '@app/models';
import { DialogComponent } from '@app/components';
import { emailRegex, nameRegex } from '@app/contants';

import { DataService } from '@app/services/data.service';
import { FreeAttemptSessionStorageService } from '@app/_user/services/free-attempt-session-storage.service';
import { PhoneValidator } from '@app/components/inputs/phone-input';
import { InformationDialogComponent } from '@app/components';

@Component({
  selector: 'app-reg-dialog',
  templateUrl: './reg-dialog.component.html',
  styleUrls: ['./reg-dialog.component.scss']
})
export class RegDialogComponent extends DialogComponent implements OnInit, OnDestroy {

  validating = false;
  selectedCountry: any;
  countriesControl: FormControl;
  countries: any[] = [];
  countryCode: string = '';
  public token: string;

  private destroySubject$: Subject<void> = new Subject();
  private singleExecutionSubscription: Subscription;

  constructor(public dialogRef: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              protected formBuilder: FormBuilder,
              protected reCaptchaV3Service: ReCaptchaV3Service,
              protected dataService: DataService,
              protected freeAttemptSessionStorageService: FreeAttemptSessionStorageService) {
    super();
  }

  ngOnInit() {
    if (!this.data.user) {
      this.data.user = {};
    }
    this.countries = countryTelData.allCountries;
    this.countryCode = this.data.countryCode || '';
    let phoneIso = this.data.user.phone_iso2 || undefined;

    if (!phoneIso && this.countryCode) {
      phoneIso = this.countryCode.toLocaleLowerCase();
    }
    this.countries.forEach(data => {
      data.value = '(+' + data.dialCode + ') ' + data.name;
    });


    this.countriesControl = new FormControl(phoneIso, Validators.nullValidator);

    this.countries.forEach(data => {
      if (phoneIso === data.iso2) {
        this.selectedCountry = data;
      }
    });

    this.countriesControl.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        this.selectedCountry = undefined;
        this.countries.forEach(data => {
          if (value === data.iso2) {
            this.selectedCountry = data;
          }
        });
        this.freeAttemptSessionStorageService.setPhoneCountry(
          this.selectedCountry ? this.selectedCountry.dialCode : '',
          this.selectedCountry ? this.selectedCountry.iso2 : ''
        );
      });

    this.form = this.formBuilder.group({
      'first_name': [this.data.user.first_name || '', [Validators.required, Validators.pattern(nameRegex), this.validateMax35.bind(this)]],
      'email': [this.data.user.email || '', [Validators.required, this.validateMax70.bind(this),
        Validators.pattern(emailRegex)], this.validateAttemptNotTaken.bind(this)],
      'job_title': [this.data.user.job_title || '', [Validators.required, this.validateMax70.bind(this)]],
      'organization': [this.data.user.organization || '', [Validators.required, this.validateMax70.bind(this)]],
      'phone': [this.data.user.phone || '', [PhoneValidator.validCountryPhone(this.countriesControl)]]
    });

    this.form.valueChanges
    .pipe(takeUntil(this.destroySubject$))
    .subscribe(value => {
      const user: User = value;
      user.phone_code = this.selectedCountry ? this.selectedCountry.dialCode : '';
      user.phone_iso2 = this.selectedCountry ? this.selectedCountry.iso2 : '';
      this.freeAttemptSessionStorageService.setUserInfo(user);
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();

    if (this.singleExecutionSubscription) {
      this.singleExecutionSubscription.unsubscribe();
    }
  }

  /**
   * Validates attempt is not taken.
   * And allows (in 'edit' case) to leave the same email.
   */
  private validateAttemptNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    if (!this.form) {
      return new Observable(null);
    }

    this.validating = true;
    return this.dataService.isAttemptValid(control.value, this.data.qId)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;
          return (res) ? null : {attemptTaken: true};
        }));
  }

  private validateMax25(control: AbstractControl) {
    if (!this.form) return null;
    const resp = control.value.length > 25 ? {max25: true} : null;
    return resp;
  }

  private validateMax35(control: AbstractControl) {
    if (!this.form) return null;
    const resp = control.value.length > 35 ? {max35: true} : null;
    return resp;
  }

  private validateMax70(control: AbstractControl) {
    if (!this.form) return null;
    const resp = control.value.length > 70 ? {max70: true} : null;
    return resp;
  }

  save() {
    this.showValidation = true;
    if (this.form.invalid || this.validating) { return; }

    const user: User = this.form.value;
    if (this.selectedCountry) {
      user.phone_code = this.selectedCountry.dialCode;
      user.phone_iso2 = this.selectedCountry.iso2;
    }

    if (user.hasOwnProperty('phone_code') && ! user.phone_code) {
      delete user.phone_code;
    }
    if (user.hasOwnProperty('phone_iso2') && ! user.phone_iso2) {
      delete user.phone_iso2;
    }
    if (user.hasOwnProperty('phone') && ! user.phone) {
      delete user.phone;
    }

    if (this.singleExecutionSubscription) {
      this.singleExecutionSubscription.unsubscribe();
    }

    this.singleExecutionSubscription = this.reCaptchaV3Service.execute('homepage')
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((token) => {
        this.closeDialog(user);
        /*this.dataService.verifyCaptcha(6Ld56bUUAAAAAJUqDTZp0HfiwmWUzCQj1yWc7W7J, token)
        .subscribe((resp) => {

        }, (err) => {

        });*/
      }, (err) => {
        const msg = `Please reload the page, there's been a server error. Your data have been saved.`;
        this.openInformationDialog(msg, 'Error');
      });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any> {
      disableClose: true,
      width: '400px',
      data: {
        disableClose: true,
        title: title,
        text: text,
        noTimer: true
      }
    });
  }

}
