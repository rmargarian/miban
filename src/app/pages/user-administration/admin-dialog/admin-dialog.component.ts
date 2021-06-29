import { Component, OnInit } from '@angular/core';
import {
  Validators,
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { DialogComponent } from '@app/components';
import { emailRegex } from '@app/contants';

@Component({
  selector: 'app-admin-dialog',
  templateUrl: './admin-dialog.component.html',
  styleUrls: ['./admin-dialog.component.scss']
})
export class AdminDialogComponent extends DialogComponent implements OnInit {
  data: any;
  validating: boolean = false;
  showConfirmPass: boolean = false;
  showValidation: boolean = false;
  private passwordValidators: ValidatorFn[];

  ngOnInit() {
    if (!this.data.admin) {
      this.data.admin = {};
    }
    this.passwordValidators = [Validators.required, Validators.minLength(8)];

    this.form = this.formBuilder.group({
      'name': [this.data.admin.name, [Validators.required]],
      'username': [this.data.admin.username, [Validators.required, Validators.minLength(4)], this.validateUserNameNotTaken.bind(this)],
      'password': ['', this.data.type === 'add' ? this.passwordValidators : undefined],
      'email': [this.data.admin.email,
        [Validators.required, Validators.pattern(emailRegex)],
        this.validateEmailNotTaken.bind(this)],
      'currency_country': [this.data.admin.currency_country || 145, [Validators.required]],
      'is_super': [this.data.admin.is_super]
    });


    this.form.get('password').valueChanges.subscribe(changes => {
      if (changes.length > 0) {
        if (this.data.type === 'edit') {
          this.form.get('password').setValidators(this.passwordValidators);
        }

        if (!this.form.controls['confirm_password']) {
          this.form.addControl('confirm_password', new FormControl('', [this.validateConfirmPass.bind(this)]));
        } else {
          this.form.get('confirm_password').updateValueAndValidity();
        }
      } else {
        if (this.data.type === 'edit') {
          this.form.get('password').clearValidators();
        }
        this.form.removeControl('confirm_password');
      }

      this.showConfirmPass = changes.length > 0;
    });
  }

  validateConfirmPass(control: AbstractControl) {
    let resp = control.value !== this.form.get('password').value ? {passwordsMismatch: true} : null;
    return resp;
  }

  validateEmailNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    if (!this.form) {
      return new Observable(null);
    }

    const oldEmail = this.data.admin.email ? this.data.admin.email.trim() : '';
    const newEmail = control.value.trim();

    this.validating = true;
    return this.validationService.isAdminEmailValid(newEmail)
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

  validateUserNameNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    this.validating = true;
    return this.validationService.isAdminUserNameValid(control.value)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;

          const sameEmail = (this.data.admin.username === control.value) ? true : false;
          let resp;
          if (this.data.admin.username) {
            resp = (sameEmail || res) ? null : {userNameTaken: true};
          } else {
            resp = (res) ? null : {userNameTaken: true};
          }
          return resp;
        }));
  }

  save() {
    this.showValidation = true;
    if (this.form.invalid || this.validating) { return; }
    
    const value = this.form.value;
    value.id = this.data.admin.id;
    value.email = value.email.trim();
    this.closeDialog(value);
  }
}
