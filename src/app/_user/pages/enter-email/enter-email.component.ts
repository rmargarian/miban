import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil, delay, map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import {
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors
} from '@angular/forms';


import {
  RootStoreState,
  AttemptStoreActions
} from '@app/root-store';

import { DataService } from '@app/services';
import { AttemptService } from '@app/_user/services';
import {
  User,
  Questionnaire,
  Keys,
  SendEmailTemplate,
  Attempt
} from '@app/models';
import { UserRoutesEnum } from '@app/_user/enums';
import { QuestionnaireStatus, QuestionnaireType } from '@app/enums';
import { getQuestionnaireFromKey } from '@app/utils';
import { emailRegex } from '@app/contants';

@Component({
  selector: 'app-enter-email',
  templateUrl: './enter-email.component.html',
  styleUrls: ['./enter-email.component.scss']
})
export class EnterEmailComponent implements OnInit, OnDestroy {

  form: FormGroup;
  key: Keys = {} as Keys;
  user: User = {} as User;
  questionnaire: Questionnaire = {} as Questionnaire;
  emailMsg: string = '';
  emailValid: boolean = false;
  validating: boolean = false;
  passwdMsg: string = '';
  errorMsg: string = '';
  configs: any[] = [];
  isAnotherKey: boolean = false;
  qName: string = '';

  private destroySubject$: Subject<void> = new Subject();
  constructor(
    private titleService: Title,
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private attemptService: AttemptService
  ) {
  }

  ngOnInit() {

    this.form = this.formBuilder.group({
      'email': [this.user.email || '', [this.validateEmail.bind(this)] , this.validateEmailExists.bind(this)
      ],
      'passwd': [this.user.passwd || '', this.user.passwd ? [Validators.required] : []],
    });

    this.dataService.getAllConfigurations().subscribe((data) => {
      this.configs = data;
    });

    combineLatest(
      this.store$.select(state => state.attempt.key),
      this.store$.select(state => state.attempt.questionnaireId)
    ).pipe(
      takeUntil(this.destroySubject$))
      .subscribe(([key, questionnaireId]) => {
        if (key && questionnaireId) {
          this.key = key;
          this.getQuestionnaire(questionnaireId);

          const title = `${this.key.title} - ${this.questionnaire.title}`;
          this.titleService.setTitle( title );
        }
      });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  /**
   * Method retreives Questionnaire object from Key data
   * @param qId (questionnaire Id)
   */
  private getQuestionnaire(qId: number) {
    this.questionnaire = getQuestionnaireFromKey(qId, this.key);
    if (!this.questionnaire) {
      this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
      this.store$.dispatch(new AttemptStoreActions.NavigateAction({path: UserRoutesEnum.ENTER_KEY}));
    }

    switch (this.questionnaire.type) {
      case QuestionnaireType.PROFILE:
        this.qName = 'Profile';
        break;
      case QuestionnaireType.ASSESSMENT:
        this.qName = 'Assessment';
        break;
      case QuestionnaireType.FEEDBACK:
        this.qName = 'Feedback';
        break;
    }
  }

  private validateEmail(control: AbstractControl): ValidationErrors  {
    this.emailMsg = '';
    this.errorMsg = '';
    this.user = null;
    this.emailValid = false;
    this.isAnotherKey = false;
    if (control.value === '') {
      return { notShowError: true };
    }
    const regex = emailRegex;

    if (!regex.test(control.value)) {
      return { email: true };
    }
    return null;
  }

  private validateEmailExists(control: AbstractControl): Observable<ValidationErrors> {
    this.validating = true;
    this.errorMsg = '';
    return this.dataService.getUsersByEmails(control.value)
      .pipe(
        delay(500),
        map((users: User[]) => {
          const user = users.length ? users[0] : null;
          this.validating = false;
          this.isAnotherKey = false;
          if (user && user.company_id === this.key.id) {
            this.user = user;
            this.emailValid = true;
            this.passwdMsg = '';
            this.form.get('passwd').setValue(user.passwd || '');
            this.emailMsg = user.passwd ?
                'Found you! Now enter your password:' :
                'Found you! Please set your password on next page';
          } else if (user && user.company_id !== this.key.id) {
            this.user = user;
            this.emailValid = false;
            this.passwdMsg = '';
            this.isAnotherKey = true;
            this.emailMsg = '';
          } else {
            this.user = null;
            this.emailValid = false;
            this.passwdMsg = '';
            this.emailMsg = `The above email address isn't registered. <br>
            Please either re-enter, <a href="mailto:Calum.Coburn@negotiations.com">contact us</a>
            or register using the button on the left.`;
          }
          return null;
      }));
  }

  onRegister() {
    const queryParams = {kId: this.key.id, qId: this.questionnaire.id};
      this.store$.dispatch(new AttemptStoreActions.NavigateAction(
        {path: UserRoutesEnum.REGISTER, queryParams: queryParams}));
  }

  /**
   * Method checks if password is correct and
   * Checks if user already completed all attempts for current Questionnaire.
   * If not and the password is correct - GO to 'AUTHENTICATE' page
   */
  continue() {
    if (this.form.invalid || !this.user) return;

    if (this.user.passwd !== this.getControl('passwd').value) {
      this.errorMsg = 'Email and/or password do not match, please try again';
      this.getControl('passwd').reset();
      return;
    }
    this.errorMsg = '';
    this.attemptService.getUserAttempts(this.user.id, this.key.id, this.questionnaire.id)
    .subscribe ((us: User) => {
      let completed_attempts = 0;
      us.attempts.forEach((attempt: Attempt) => {
        if (attempt.status === QuestionnaireStatus.COMPLETED) {
          completed_attempts++;
        }
      });
      /**If all given attempts are completed */
      if (us.attempts.length !== 0 /**New attempt not created yet */
        && (
          (us['u_q_limit'] && completed_attempts === us['u_q_limit'].attempts_limit) /**Attempts limit has been set */ ||
          (!us['u_q_limit'] && completed_attempts === 1) /**Attempts limit hasn't been set but one (default) attempt was completed */
        )
      ) {
        this.errorMsg = `[ERROR] You have already completed this ${this.qName}`;
        this.getControl('passwd').reset();
      } else {
        const queryParams = {kId: this.key.id, qId: this.questionnaire.id, uId: this.user.id};
        this.store$.dispatch(new AttemptStoreActions.NavigateAction(
          {path: UserRoutesEnum.AUTHENTICATE, queryParams: queryParams}));
      }
    });
  }

  forgotPassword() {
    const template: SendEmailTemplate = {} as SendEmailTemplate;
    template.email_subject = this.configs[1].value;
    template.tpl_content = this.configs[2].value;
    this.sendEmails(template, UserRoutesEnum.ENTER_EMAIL);
  }

  changeKey() {
    const template: SendEmailTemplate = {} as SendEmailTemplate;
    template.email_subject = this.configs[7].value;
    template.tpl_content = this.configs[6].value;
    this.sendEmails(template, UserRoutesEnum.CHANGE_KEY, this.configs[5].value);
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
      if (path === UserRoutesEnum.CHANGE_KEY) {
        this.passwdMsg = `Email has been sent to ${this.user.email}. Please check your mail box.`;
      } else {
        this.passwdMsg = `Your password has been emailed to ${this.user.email}`;
      }
    }, err => {
      this.validating = false;
      this.passwdMsg = 'Server error';
      throw new Error('Enter Email::sendEmails: ' + err);
    });
  }

}
