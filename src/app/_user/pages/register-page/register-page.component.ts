import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil} from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material';

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
  Attempt
} from '@app/models';
import { UserRoutesEnum } from '@app/_user/enums';
import { QuestionnaireStatus, QuestionnaireType } from '@app/enums';
import { getQuestionnaireFromKey } from '@app/utils';
import { InformationDialogComponent } from '@app/components';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit, OnDestroy {

  data: {key: Keys, user: User, questionnaire: Questionnaire};
  key: Keys;
  questionnaire: Questionnaire = {} as Questionnaire;
  notRegistred: boolean;
  pfa_route: string = '';

  loading: boolean = true;
  errorMsg: string = '';
  completed: boolean = false;
  userWithAttempts: any;
  qName: string = '';

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private titleService: Title,
    private store$: Store<RootStoreState.State>,
    private dataService: DataService,
    private attemptService: AttemptService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    combineLatest(
      this.store$.select(state => state.attempt.key),
      this.store$.select(state => state.attempt.user),
      this.store$.select(state => state.attempt.questionnaireId),
      this.store$.select(state => state.attempt.userLoading),
      this.store$.select(state => state.attempt.notRegistred),
      this.store$.select(state => state.route.childRoute)
    ).pipe(
      takeUntil(this.destroySubject$))
      .subscribe(([key, user, questionnaireId, userLoading, notRegistred, route]) => {
        if (!userLoading && (key && user) || (key && notRegistred)) {
          this.key = key;
          this.pfa_route = route;
          this.getQuestionnaire(questionnaireId);

          const title = `${this.key.title} - ${this.questionnaire.title}`;
          this.titleService.setTitle( title );

          this.notRegistred = notRegistred;
          this.data = {key: key, user: user, questionnaire: this.questionnaire};

          this.userWithAttempts = user;
          this.checkIfTimeout();
          this.checkIfCompleted();
          this.loading = false;
        } else if (!userLoading && !notRegistred && !user) {
          this.loading = false;
          this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          this.store$.dispatch(new AttemptStoreActions.NavigateAction({path: UserRoutesEnum.ENTER_KEY}));
        }
      });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
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

  /**
   * Checks if user already completed current Questionnaire.
   * @param user (User | null (if user not registred yet))
   */
  private checkIfCompleted() {
    if (!this.userWithAttempts) { return; }

    const us = this.userWithAttempts;
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
      try {
        document.getElementsByTagName('app-user')[0].scrollTo(0, 0);
      } catch (error) {

      }
      this.errorMsg = `[ERROR] You have already completed this ${this.qName}`;
      this.completed = true;
    }
  }

  /**
   * Finds the first timedout attempt and changes it's status to 'REOPENED'
   * and passed_time to 0.
   * @param user (User | null (if user not registred yet))
   */
  private checkIfTimeout() {
    if (!this.userWithAttempts) { return; }

    const us = this.userWithAttempts;
    for (const attempt of us.attempts) {
      if (attempt.status === QuestionnaireStatus.TIMEOUT) {
        const att = {} as Attempt;
        att.id = attempt.id;
        att.status = QuestionnaireStatus.REOPENED;
        att.passed_time = 0;
        att.is_note_sent = 0;
        this.dataService.updateAttempt(att).subscribe(
          data => {

          }, (err) => {
            const msg = `Please reload the page, there's been a server error.`;
            this.openInformationDialog(msg, 'Error');
            throw new Error('Reg page::dataService.updateAttempt: ' + err);
          }
        );
        break;
      }
    }
  }

  onSave($event) {
    const user: User = $event.user;
    if (this.notRegistred) {
      this.dataService.createUser(user, true).subscribe((us: User) => {
        if (us) {
          us.attempts = [];
          this.startAttempt(us);
        }
      }, (err) => {
        const msg = `Please reload the page, there's been a server error.`;
        this.openInformationDialog(msg, 'Error');
        throw new Error('Reg page::dataService.createUser: ' + err);
       });
    } else {
      this.dataService.updateUser(user, true).subscribe((us: User) => {
        if (us && !this.completed) {
          this.startAttempt(this.userWithAttempts);
        }
      }, (err) => {
        const msg = `Please reload the page, there's been a server error.`;
        this.openInformationDialog(msg, 'Error');
        throw new Error('Reg page::dataService.updateUser: ' + err);
       });
    }
  }

  /**
   * Updates user's IP address.
   * Navigates to 'start' route.
   * @param user (User)
   */
  private startAttempt(user: User) {
    this.loading = true;
    this.dataService.updateUserIp({id: user.id} as User).subscribe(() => {
      this.navigateToStartAttempt(user);
    }, (err) => {
      this.loading = false;
      const msg = `Please reload the page, there's been a server error.`;
      this.openInformationDialog(msg, 'Error');
      throw new Error('Reg page::dataService.updateUserIp: ' + err);
     });
  }

  /**
   * If found not completed attempt navigate to Start attempt page,
   * or create new attempt and then navigate
   */
  private navigateToStartAttempt(us: User) {
    this.loading = true;
    this.attemptService.getUserAttempts(us.id, this.key.id, this.questionnaire.id)
    .subscribe((user: User) => {
      this.loading = false;
      this.userWithAttempts = user;
      this.checkIfTimeout();
      for (const attempt of user.attempts) {
        if (attempt.status !== QuestionnaireStatus.COMPLETED) {
          const queryParams = { kId: this.key.id, qId: this.questionnaire.id, uId: user.id };
          this.store$.dispatch(new AttemptStoreActions.NavigateAction({ path: UserRoutesEnum.START, queryParams: queryParams }));
          return;
        }
      }

      this.checkIfCompleted();
      if (!this.completed) {
        this.createAttempt(user);
      }
    }, err => {
      this.loading = false;
      const msg = `Please reload the page, there's been a server error.`;
      this.openInformationDialog(msg, 'Error');
      throw new Error('Reg page::attemptService.getUserAttempts: ' + err);
    });
  }

   /**
   * Creates new attempt for Questionnaire.
   */
  private createAttempt(user: User) {
    const att = {
      user_id: user.id,
      questionnaire_id: this.questionnaire.id,
      status: QuestionnaireStatus.STARTED_REGISTER,
      passed_time: 0} as Attempt;

    this.attemptService.createAttempt(att)
    .subscribe ((attempt: Attempt) => {
      if (attempt) {
        this.loading = false;
        const queryParams = { kId: this.key.id, qId: this.questionnaire.id, uId: user.id };
        this.store$.dispatch(new AttemptStoreActions.NavigateAction({ path: UserRoutesEnum.START, queryParams: queryParams }));
      }
     }, (err) => {
      this.loading = false;
      const msg = `Please reload the page, there's been a server error.`;
      this.openInformationDialog(msg, 'Error');
      throw new Error('Reg page::attemptService.createAttempt: ' + err);
     });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      width: '400px',
      data: {
        title: title,
        text: text,
        noTimer: true
      }
    });
  }

}
