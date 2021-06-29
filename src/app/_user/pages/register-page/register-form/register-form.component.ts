import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { takeUntil, distinctUntilChanged, delay, map } from 'rxjs/operators';
import {
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors
} from '@angular/forms';

import {
  RootStoreState,
  SharedStoreSelectors,
  TrainingCourseStoreSelectors
} from '@app/root-store';

import { AttemptService } from '@app/_user/services';
import { DataService } from '@app/services';
import {
  User,
  Questionnaire,
  CareerCategory,
  TrainingCourse,
  Country,
  Currency,
  Keys,
  CountryState,
  SharedModel,
  SendEmailTemplate
} from '@app/models';
import { Countries, QuestionnaireType } from '@app/enums';
import { emailRegex, nameRegex } from '@app/contants';
import { UserRoutesEnum } from '@app/_user/enums';

/**
 * Components contains form with auth/reg participant controls.
 * Some fields are default and some can be Shown/Edited/be Mandatory depending on Key settings.
 * Location & Date are showed if these fields are populated for the participant - and always non-editable.
 */
@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit, OnDestroy {

  @Input()
  set data(data: {key: Keys, user: User, questionnaire: Questionnaire}) {
    if (!data) { return; }
    this.user = data.user;
    this.key = data.key;
    this.isProfile = data.questionnaire.type === QuestionnaireType.PROFILE ? true : false;
    this.initForm();
  }
  @Input() btnText: string = '';
  @Input() completed: boolean = false;
  @Input() questionnaire: Questionnaire = {} as Questionnaire;
  @Output() save = new EventEmitter();

  form: FormGroup;
  user: User;
  key: Keys;
  countryId: number;
  isProfile: boolean = true;
  filteredStates: CountryState[] = [];
  configs: any[] = [];
  passwdMsg: string = '';

  careers: CareerCategory[] = [];
  trainings: TrainingCourse[] = [];
  countries: Country[] = [];
  currencies: Currency[] = [];
  states: CountryState[] = [];

  validating: boolean = false;
  showValidation: boolean = false;

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private attemptService: AttemptService,
    private dataService: DataService
  ) { }


  ngOnInit() {
    this.getSharedData();
    this.dataService.getAllConfigurations().subscribe((data) => {
      this.configs = data;
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  /**
   * Get data needed for input selects
   */
  private getSharedData() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(SharedStoreSelectors.selectAll)).subscribe((data: SharedModel) => {
        if (!data) { return; }
        this.careers = data.careers;
        this.countries = data.countries;
        this.states = data.countriesStates;
        this.currencies = JSON.parse(JSON.stringify(data.currencies));
        this.currencies.forEach(function (curr) {
          curr.currency += ' ' + curr.currency_name;
        });
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(TrainingCourseStoreSelectors.selectAll))
      .subscribe((data: TrainingCourse[]) => {
      this.trainings = data;
    });
  }

  private initForm() {
    if (!this.user) {
      this.user = {} as User;
    }

    this.form = this.formBuilder.group({
      'company_name': [this.key.title || ''],
      'first_name': [this.user.first_name || '', [Validators.required, Validators.pattern(nameRegex), this.validateMax35.bind(this)]],
      'last_name': [this.user.last_name || '', [Validators.required, Validators.pattern(nameRegex), this.validateMax35.bind(this)]],
      'email': [this.user.email || '', [Validators.required, this.validateMax70.bind(this),
        Validators.pattern(emailRegex)] , this.validateEmailNotTaken.bind(this)
      ],
      'company_id': [this.key.id, [Validators.required]],
      'passwd': ['', [Validators.required, this.validateMax25.bind(this)], this.validatePassword.bind(this)],
      'confirm_passwd': [''],
      'career_category_id': [this.user.career_category_id || this.key.c_category || ''],
      'industry_sector': [this.user.industry_sector || this.key.industry_sector || ''],
      'job_title': [this.user.job_title || this.key.job_title || ''],
      'department': [this.user.department || this.key.department || ''],
      'manager_name': [this.user.manager_name || this.key.manager_name || ''],
      'training_date': [this.key.training_date || ''],
      'training_course_id': [this.user.training_course_id || this.key.training_course_id || ''],
      'country_id': [this.user.country_id || this.key.country_id || ''],
      'state_name': [this.user.state_name || this.key.state_name || ''],
      'city': [this.user.city || this.key.city || ''],
      'currency_id': [this.user.currency_id || '', this.isProfile ? [Validators.required] : []],
      'p_location': [this.user.p_location || ''],
      'p_date': [this.user.p_date ? this.user.p_date : '']
    });

    if (!this.user.passwd) {
      this.form.controls['confirm_passwd'].setValidators([Validators.required, this.validateConfirmPass.bind(this)]);
      this.form.get('confirm_passwd').updateValueAndValidity();

      this.form.controls['passwd'].setAsyncValidators([]);
      this.form.get('passwd').updateValueAndValidity();

      this.getControl('passwd').valueChanges.subscribe(value => {
        this.form.get('confirm_passwd').updateValueAndValidity();
      });
    }

    this.countryId = this.user.country_id;
    this.updateStates();
    this.setValidatorsByKey();
    this.setDisabled();

    this.getControl('country_id').valueChanges.subscribe(value => {
      this.changeCurrencyByCountry(value);
      this.countryId = value;
      this.updateStates();
    });
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  private validateConfirmPass(control: AbstractControl) {
    if (!this.form) return null;
    const resp = control.value !== this.form.get('passwd').value ? {passwordsMismatch: true} : null;
    return resp;
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

  changeCurrencyByCountry(value: number) {
    for (let i = 0; i < this.countries.length; i++) {
      if (this.countries[i].id === value) {
        this.form.get('currency_id').setValue(this.countries[i].currency_id);
        break;
      }
    }
  }

  validateEmailNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    const oldEmail = this.user.email ? this.user.email.trim() : '';
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

  validatePassword(control: AbstractControl): Observable<ValidationErrors> {
    const data = {email: this.form.controls['email'].value, passwd: control.value};
    this.passwdMsg = '';

    this.validating = true;
    return this.dataService.isPasswordValid(data)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;
          return res ? null : {invalidPasswd: true};
        }));
  }

  /**
   * If AUSTRALIA or UNITED_STATES is chosen as a country,
   * input field must be replaced on select with states for AUSTRALIA/UNITED_STATES
   */
  private updateStates() {
    if (this.countryId === Countries.AUSTRALIA || this.countryId === Countries.UNITED_STATES) {
      this.filteredStates = this.states.filter(obj => obj.country_id === this.countryId);
      this.filteredStates = this.filteredStates.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  /**
   * Method checks 'key' settings and
   * set controls to required or not
   * @param companyId (Key id)
   */
  private setValidatorsByKey() {
    const company = this.key;

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
      this.form.controls['job_title'].setValidators([Validators.required, this.validateMax70.bind(this)]);
    } else {
      this.form.controls['job_title'].setValidators([this.validateMax70.bind(this)]);
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
    /**Training date disabled by default in Key settings */
    this.form.controls['training_date'].disable();

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

    this.form.controls['p_date'].disable();
  }

  onSave() {
    this.showValidation = true;
    if (this.form.invalid || this.validating || this.completed) { return; }

    this.validating = true;
    const user = this.form.value;
    user.id = this.user.id;
    user.email = user.email.trim();
    this.save.emit({user: user});
  }

  forgotPassword() {
    const template: SendEmailTemplate = {} as SendEmailTemplate;
    template.email_subject = this.configs[1].value;
    template.tpl_content = this.configs[2].value;
    this.sendEmails(template, UserRoutesEnum.AUTHENTICATE);
  }

  /**
   * Sends all needed data (for sending user email) into api service.
   * @param template (selected template)
   * @param path (path needed to configure correct url)
   */
  private sendEmails(template: SendEmailTemplate, path: string, toAdminSubj?: string) {
    this.validating = true;
    this.attemptService
    .sendEmails(
      template,
      this.user.id,
      this.key,
      this.questionnaire,
      path,
      toAdminSubj)
    .subscribe(() => {
      this.validating = false;
      this.passwdMsg = `Your password has been emailed to ${this.form.controls.email.value}`;
    }, err => {
      this.validating = false;
      this.passwdMsg = 'Server error';
      throw new Error('Enter Email::sendEmails: ' + err);
    });
  }

}
