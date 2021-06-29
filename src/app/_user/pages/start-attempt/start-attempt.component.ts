import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest, interval, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { takeUntil, take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material';

import {
  RootStoreState,
  AttemptStoreActions,
  AttemptStoreSelectors
} from '@app/root-store';

import { DataService, TooltipService } from '@app/services';
import { AttemptService, SessionStorageService } from '@app/_user/services';
import {
  User,
  Questionnaire,
  Keys,
  QuestionGroup,
  Attempt
} from '@app/models';
import { mQuestionsTooltip } from '@app/contants';
import { AttemptData } from '../../models';
import { QuestionnaireStatus, QuestionnaireType } from '@app/enums';
import { UserRoutesEnum } from '@app/_user/enums';
import { getQuestionnaireFromKey, isIE } from '@app/utils';

import { InformationDialogComponent, ConfirmationDialogComponent } from '@app/components';

enum BtnsTextEnum {
  BACK = '<< Back',
  NEXT = 'Next >>',
  FINISH = 'Finish >>'
}

/**
 * Base Class for rendering Question Groups pages
 * Responsiple for retreaving/store all data from server and pagination
 */
@Component({
  selector: 'app-start-attempt',
  templateUrl: './start-attempt.component.html',
  styleUrls: ['./start-attempt.component.scss']
})
export class StartAttemptComponent implements OnInit, OnDestroy {
  data: {key: Keys, user: User, group: QuestionGroup, attempt: Attempt, currPage: number, YPos: number};
  key: Keys;
  user: User = {} as User;
  currAttempt: Attempt;
  questionnaire: Questionnaire = {} as Questionnaire;
  groups: QuestionGroup[];
  qName: string = '';

  currPageNumber: number = 1;
  totalPageNumber: number = 0;
  backBtnText: string = BtnsTextEnum.BACK;
  nextBtnText: string = BtnsTextEnum.NEXT;
  nextBtnTooltipText = mQuestionsTooltip;

  formInvalid: boolean = true;
  firstInvalidId: string = '';

  totalQuestions: number = 0;
  avaliableQuestions: number = 0;
  avaliablePercentage: number = 0;

  passed_time: number = 0;
  remaining_time: number = 0;
  fiveMinuteLeftShowed: boolean = false;
  isOutOfLimit: boolean = false;
  isFinished: boolean = false;
  loading: boolean = false;
  finishing: boolean = false;
  erorrPopShowed: boolean = false;
  isAdmin: boolean = false;
  showValidation: boolean = false;
  isStarted: boolean = false;

  private timerSubject$: Subject<void> = new Subject();
  private pingTimerSubject$: Subject<void> = new Subject();
  private updateInterval$;

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private titleService: Title,
    private store$: Store<RootStoreState.State>,
    private attemptService: AttemptService,
    private sessionStorageService: SessionStorageService,
    private dataService: DataService,
    private tooltipService: TooltipService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    combineLatest(
      this.store$.select(state => state.attempt.key),
      this.store$.select(state => state.attempt.user),
      this.store$.select(state => state.attempt.questionnaireId),
      this.store$.select(state => state.attempt.userLoading),
      this.store$.select(state => state.attempt.keyLoading),
      this.store$.select(state => state.attempt.questions_groups)
    ).pipe(
      takeUntil(this.destroySubject$))
      .subscribe(([key, user, questionnaireId, userLoading, keyLoading, groups]) => {
        if (!userLoading && !keyLoading && (user && key && groups && groups.length)) {
          if (this.updateInterval$) { return; }

          this.groups = JSON.parse(JSON.stringify(groups));
          this.totalPageNumber = groups.length;
          this.setNextBtnText();
          this.key = JSON.parse(JSON.stringify(key));
          this.user = JSON.parse(JSON.stringify(user));

          this.getQuestionnaire(questionnaireId);

          const title = `${this.key.title} - ${this.questionnaire.title}`;
          this.titleService.setTitle( title );

          this.setTotalQuestionsCount();
          this.getCurrentAttempt();
          this.setAvalibleQuestions();
        } else if ((!userLoading && !user) || (!keyLoading && !key)) {
          this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          this.store$.dispatch(new AttemptStoreActions.NavigateAction({path: UserRoutesEnum.ENTER_KEY}));
        }
      });

      this.store$.pipe(
        take(1),
        select(AttemptStoreSelectors.selectIsAdmin)
      ).subscribe((isAdmin: boolean) => {
        this.isAdmin = isAdmin;
      });
  }

  ngOnDestroy() {
    if (this.destroySubject$) {
      this.destroySubject$.next();
      this.destroySubject$.complete();
    }
    if (this.timerSubject$) {
      this.timerSubject$.next();
      this.timerSubject$.complete();
    }
    this.sessionStorageService.resetState();
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
   * For not admin access:
   * Checks if user 'timeout' status for current Questionnaire.
   * Checks if user already completed current Questionnaire.
   * If there is a valid attempt:
   *  sets current attempt or creates new attempt,
   *  sets data for active page.
   *  starts Questionnaire timer.
   *  updates last activity date.
   */
  private getCurrentAttempt() {
    const us = this.user;
    if (this.isAdmin) {
      if (us.attempts.length !== 0) {
        this.currAttempt = us.attempts[us.attempts.length - 1];
        this.isStarted = this.currAttempt.answers.length > 0 ? true : false;
        this.setPageData();
        this.goToLastLocation();
        const timeLimit = this.questionnaire.incomplete_timeout * 60;
        this.passed_time = this.currAttempt.passed_time;
        this.remaining_time = timeLimit - this.passed_time;

        interval(1000).pipe(
          takeUntil(this.timerSubject$)
        ).subscribe(t => {
          if (this.timerSubject$) {
            this.timerSubject$.next();
            this.timerSubject$.complete();
          }
        });

      } else {
        const msg = `Participant didn't start this ${this.qName} yet.`;
        this.openInformationDialog(msg, 'Error');
      }
      return;
    }

    let completed_attempts = 0;
    for (const attempt of us.attempts) {
      if (attempt.status === QuestionnaireStatus.TIMEOUT) {
        this.isOutOfLimit = true;
        return;
      } else if (attempt.status === QuestionnaireStatus.COMPLETED) {
        completed_attempts++;
      } else { /**If exists not completed attempt */
        this.currAttempt = attempt;
        this.isStarted = this.currAttempt.answers.length > 0 ? true : false;
        this.startTimer();
        this.setPageData();
        this.goToLastLocation();
        
        /**Update last activity date */
        const att = {} as Attempt;
        att.id = this.currAttempt.id;
        this.updateAttempt(att);
      
        return;
      }
    }
    /**If all given attempts are completed */
    if (us.attempts.length !== 0 /**First (default) attempt already created */
      && (
        (us['u_q_limit'] && completed_attempts === us['u_q_limit'].attempts_limit) /**Attempts limit has been set and all attempts are completed*/
        || (!us['u_q_limit'] && completed_attempts === 1) /**Attempts limit hasn't been set but one (default) attempt was completed */
      )
    ) {
      const queryParams = { kId: this.key.id, qId: this.questionnaire.id, uId: this.user.id };
      this.store$.dispatch(new AttemptStoreActions.NavigateAction({ path: UserRoutesEnum.AUTHENTICATE, queryParams: queryParams }));
    } else {
      const msg = `To start your "${this.questionnaire.title}" please authenticate first.`;
      const dialogRef = this.openInformationDialog(msg, 'Information');
      dialogRef.afterClosed()
        .pipe(takeUntil(this.destroySubject$))
        .subscribe((data: any) => {
          const queryParams = { kId: this.key.id, qId: this.questionnaire.id, uId: this.user.id };
          this.store$.dispatch(new AttemptStoreActions.NavigateAction({ path: UserRoutesEnum.AUTHENTICATE, queryParams: queryParams }));
        });
    }
  }

  private updateAttempt(attempt: Attempt) {
    this.attemptService.getAttemptById(attempt.id).subscribe(
      (att) => {
        if (att.status === QuestionnaireStatus.COMPLETED) {
          const queryParams = { kId: this.key.id, qId: this.questionnaire.id, uId: this.user.id };
          this.store$.dispatch(new AttemptStoreActions.NavigateAction({ path: UserRoutesEnum.AUTHENTICATE, queryParams: queryParams }));
          return;
        }
        this.dataService.updateAttempt(attempt).subscribe(
          (data) => { },
          (err) => {
            throw new Error('Start Attempt::dataService.updateAttempt: ' + err);
        });
      },
      (err) => {
        throw new Error('Start Attempt::attemptService.getAttemptById: ' + err);
    });
  }

  /**
   * Sets data needed for rendering current page.
   */
  private setPageData() {
    this.data = {key: this.key, user: this.user, group: this.groups[this.currPageNumber - 1],
      attempt: this.currAttempt, currPage: this.currPageNumber, YPos: 0};
    this.loading = false;
  }

  /**
   * Retreives from local storage page number and Y position,
   * plus questionnaire id, user id and key id to compare if stored attempt is
   * equal to current. And if equal, sets stored page and cursor position as current.
   */
  private goToLastLocation() {
    const state: AttemptData = this.sessionStorageService.getState();
    if (state && state.kId === this.key.id && state.uId === this.user.id &&
      state.qId === this.questionnaire.id) {

      this.currPageNumber = state.currPage;
      this.setNextBtnText();
      this.data = {key: this.key, user: this.user, group: this.groups[this.currPageNumber - 1],
          attempt: this.currAttempt, currPage: this.currPageNumber, YPos: state.YPos};
      this.loading = false;
    }
  }

  /**
   * Starts attempt's timer
   */
  private startTimer() {
    if (this.updateInterval$) { return; }
    const timeLimit = this.questionnaire.incomplete_timeout * 60;
    this.passed_time = this.currAttempt.passed_time;

    this.updateInterval$ = interval(1000).pipe(
      takeUntil(this.timerSubject$)
    ).subscribe(t => this.updateTimer(timeLimit));
  }

  private ping() {
    if (!this.pingTimerSubject$) {
      this.pingTimerSubject$ = new Subject();
    }
    interval(3000)
      .pipe(takeUntil(this.pingTimerSubject$))
      .subscribe(() =>
        this.dataService.ping()
          .subscribe(() => {
            if (this.pingTimerSubject$) { this.pingTimerSubject$.next(); }
            window.location.reload();
          }, (err) => {
            throw new Error('Start Attempt::dataService.ping: ' + err);
          }));
  }

  /**
   * Updates remaining time and passed time every second.
   * And stores passed time in DB every 10 seconds.
   * @param timeLimit (time limit in seconds set for Questionnaire)
   */
  private updateTimer(timeLimit: number) {
    if (this.isOutOfLimitCheck(timeLimit)) {
      return;
    }
    this.checkIf30MinuteLeft(timeLimit);

    this.passed_time += 1;
    this.remaining_time = timeLimit - this.passed_time;
    if (this.passed_time % 10 === 0) {
      const attempt = {} as Attempt;
      attempt.id = this.currAttempt.id;
      attempt.passed_time = this.passed_time;
      let dialogRef;
      this.dataService.updateAttempt(attempt).subscribe(
        data => {
          if (dialogRef) {
            dialogRef.Cancel();
            this.erorrPopShowed = false;
          }
        },
        (err) => {
          const msg = `Please reload the page, your internet connection appears to have been lost.
          Your responses have been saved.`;
          if (!this.erorrPopShowed) {
            dialogRef = this.openInformationDialog(msg, 'Information');
            dialogRef.afterClosed()
            .pipe(takeUntil(this.destroySubject$))
            .subscribe((data: any) => {
              this.erorrPopShowed = false;
            });

            if (this.timerSubject$) {
              this.timerSubject$.next();
              this.timerSubject$.complete();
            }
            this.ping();
          }
          this.erorrPopShowed = true;
          throw new Error('Start Attempt::dataService.updateAttempt: ' + err);
        });
    }
  }

  /**
   * If passed time is >= to time limit:
   *  stops the timer,
   *  shows Information popup,
   *  sets current attempt status to TIMEOUT,
   *  sends Timeout email,
   *  returns true.
   * Or returns false.
   * @param timeLimit (Questionnaire time limit in minutes)
   */
  private isOutOfLimitCheck(timeLimit: number): boolean {
    if (this.passed_time >= timeLimit) {
      if (this.timerSubject$) {
        this.timerSubject$.next();
        this.timerSubject$.complete();
      }

      //const maxTime = transformTimeWithCheck(timeLimit);
      const msg = `You've timed out. All your responses were saved.
      If you believe this was in error or experienced technical difficulties and would like to re-open your ${this.qName},
      please contact us.`;
      const dialogRef = this.openInformationDialog(msg, 'Information');

      dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        this.isOutOfLimit = true;
      });

      this.currAttempt.status = QuestionnaireStatus.TIMEOUT;
      this.currAttempt.is_note_sent = 1;
      
      const attempt = {} as Attempt;
      attempt.id = this.currAttempt.id;
      attempt.status = QuestionnaireStatus.TIMEOUT;
      attempt.is_note_sent = 1;
      this.dataService.updateAttempt(attempt).subscribe(
        (data) => { },
        (err) => {
          throw new Error('Start Attempt::dataService.updateAttempt: ' + err);
      });
      const q = this.questionnaire;
      /**Send timeout email */
      if (q.pubreg_email_subject && q.pubreg_email_template) {
        this.attemptService.sendTimeoutEmail(this.user.id, this.key, q).subscribe(
          data => {},
          err => {
            throw new Error('Start Attempt::attemptService.sendTimeoutEmail: ' + err);
          }
        );
      }
      return true;
    }

    return false;
  }

  /**
   * Shows warning popup if remaining time <= 30 minute.
   * @param timeLimit (Questionnaire time limit)
   */
  private checkIf30MinuteLeft(timeLimit: number) {
    if (((timeLimit - this.passed_time) <= (60 * 30)) && !this.fiveMinuteLeftShowed) {
      this.fiveMinuteLeftShowed = true;
      const minutes: number = Math.floor((timeLimit - this.passed_time) / 60) || 1;
      const msg = `You have ${minutes} minutes remaining, please complete your
      "${this.questionnaire.title}"`;
      this.openInformationDialog(msg, 'Warning');
    }
  }

  /**
   * Gets current attempt (Include answers with answer_options) by id.
   */
  private updateCurrentAttempt() {
    this.attemptService.getUserAttempts(this.user.id, this.key.id, this.questionnaire.id)
    .subscribe ((us: User) => {
      for (const attempt of us.attempts) {
        if (attempt.id === this.currAttempt.id) {
          this.currAttempt = attempt;
          this.isStarted = this.currAttempt.answers.length > 0 ? true : false;
          this.setPageData();
        }
      }
    }, err => {
      throw new Error('Start Attempt::attemptService.getUserAttempts: ' + err);
    });

    this.setAvalibleQuestions();
  }

  /**
   * Counts total questions number
   */
  private setTotalQuestionsCount() {
    this.totalQuestions = 0;
    this.groups.forEach((group: QuestionGroup) => {
        this.totalQuestions += group.group_questions_map.length;
    });
  }

  /**
   * Counts questions number from current page and all previous pages
   */
  private setAvalibleQuestions() {
    this.avaliableQuestions = 0;
    for (let i = 0; i < this.currPageNumber; i++) {
      this.avaliableQuestions += this.groups[i].group_questions_map.length;
    }

    this.setAvaliablePercentage();
  }

  /**
   * Counts persentage of avaliable (from current and previous pages) questions
   */
  private setAvaliablePercentage() {
    this.avaliablePercentage = Math.round(this.avaliableQuestions * 100 / this.totalQuestions);
  }

  /**
   * Sets 'Next' button text:
   * 'Finish' - for last page,
   * 'Next' - for other pages.
   */
  private setNextBtnText() {
    this.nextBtnText = this.currPageNumber === this.totalPageNumber ? BtnsTextEnum.FINISH : BtnsTextEnum.NEXT;
  }

  /**
   * Returns to the prev page
   */
  onBack() {
    this.loading = true;
    setTimeout(() => {
      if (this.currPageNumber === 1) {
        const queryParams = {kId: this.key.id, qId: this.questionnaire.id, uId: this.user.id};
        this.store$.dispatch(new AttemptStoreActions.NavigateAction(
          {path: UserRoutesEnum.AUTHENTICATE, queryParams: queryParams}));
        return;
      } else {
        this.showValidation = true;
        this.currPageNumber --;
        this.updateCurrentAttempt();
      }

      this.setNextBtnText();
    }, 500);
  }

  /**
   * Goes to the next page
   */
  onNext() {
    this.showValidation = false;
    if (this.currPageNumber === this.totalPageNumber) {
      this.confirmFinishing();
      return;
    } else {
      this.loading = true;
      setTimeout(() => {
        this.formInvalid = true;
        this.currPageNumber ++;
        this.updateCurrentAttempt();
        this.setNextBtnText();
      }, 500);
    }
  }

  /**
   * Opens Confirmation dialog for finishing attempt.
   * If user clicked 'Ok' button:
   *  stops the timer,
   *  sets attempt's status to 'COMPLETED',
   *  sets isFinished to true.
   */
  confirmFinishing() {
    if (!this.isStarted) {
      const msg = `You have not answered a single question.`;
      this.openInformationDialog(msg, 'Please respond');
      return;
    }

    const text = 'One final chance to review your responses. Click "Cancel" to review, "Ok" to complete';
    const dialogRef = this.openConfirmationDialog(text, 'Confirm Finishing');
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((data: any) => {
      if (data) {
        if (this.timerSubject$) {
          this.timerSubject$.next();
          this.timerSubject$.complete();
        }
        this.loading = true;
        this.finishing = true;
        const obj = {
          aId: this.currAttempt.id,
          uId: this.user.id,
          qId: this.questionnaire.id,
          kId: this.key.id,
          passed_time: this.passed_time,
          isAdmin: this.isAdmin};

        this.attemptService.completeAttempt(obj)
          .subscribe(() => {
            this.finishing = false;
            this.isFinished = true;
            this.loading = false;
            this.sessionStorageService.resetState();
          }, err => {
            this.openInformationDialog(err.message, 'Error');
            this.loading = false;
            this.finishing = false;
            throw new Error('Start Attempt::attemptService.completeAttempt: ' + err);
          });
      }
    });
  }

  /**
   * Sets formInvalid value
   * @param $event (boolean) form.valid value
   */
  onFormChanged($event) {
    this.formInvalid = !$event.formValid;
    this.firstInvalidId = $event.firstInvalidId;

    if ($event.isStarted) { this.isStarted = true; }

    const attempt = {} as Attempt;
    attempt.id = this.currAttempt.id;
    attempt.passed_time = this.passed_time;

    if (!this.isAdmin) {
      this.updateAttempt(attempt);
    }
  }

  /**
   * Shows notification tooltip to complete all Mandatory questions
   */
  nextDisabledBtnClicked($event) {
    this.showValidation = true;
    const elem = document.getElementById(this.firstInvalidId);
    if (elem) {
      try {
        elem.scrollIntoView();
      } catch (error) {

      }
    }

    if (!isIE()) {
     // this.tooltipService.reset();
     // this.tooltipService.createTooltip($event.target.parentElement, 'bottom', this.nextBtnTooltipText, 'error-tooltip', false);
    }
  }

  /**
   * Hides notification tooltip
   */
  nextDisabledBtnMouseOut($event) {
    if (!isIE()) {
      this.tooltipService.reset();
    }
  }

  private openConfirmationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '500px',
      data: {
        title: title,
        text: text,
        okText: 'Ok',
        cancelText: 'Cancel'
      }
    });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any> {
      disableClose: true,
      width: '500px',
      data: {
        disableClose: true,
        title: title,
        text: text,
        noTimer: true
      }
    });
  }
}
