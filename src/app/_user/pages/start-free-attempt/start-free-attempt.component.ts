import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest, interval } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { takeUntil, take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material';

import {
  RootStoreState,
  AttemptStoreActions,
  SharedStoreSelectors
} from '@app/root-store';

import { AttemptService, FreeAttemptSessionStorageService, IncompleteAttemptService } from '@app/_user/services';
import { FreeAttemptData } from '@app/_user/models';
import { InformationDialogComponent, ConfirmationDialogComponent } from '@app/components';

import { DataService, TooltipService } from '@app/services';
import {
  User,
  Questionnaire,
  Keys,
  QuestionGroup,
  Attempt,
  UserAnswer,
  UserAnswerOption,
  Country,
  IncompleteAttempt
} from '@app/models';
import { QuestionnaireStatus, IncompleteAttemptStatus } from '@app/enums';
import { mQuestionsTooltip } from '@app/contants';
import {
  isIE,
  getQuestionnaireFromKey} from '@app/utils';

import { RegDialogComponent } from './reg-dialog/reg-dialog.component';
import { FinalDialogComponent } from './final-dialog/final-dialog.component';

enum BtnsTextEnum {
  BACK = '<< Back',
  EXIT = '<< Exit',
  NEXT = 'Next >>',
  FINISH = 'Finish >>'
}

/**
 * Base Class for rendering Question Groups pages
 * Responsiple for retreaving/store all data from server and pagination
 */
@Component({
  selector: 'app-start-free-attempt',
  templateUrl: './start-free-attempt.component.html',
  styleUrls: ['./start-free-attempt.component.scss']
})
export class StartFreeAttemptComponent implements OnInit, OnDestroy {
  data: {key: Keys, group: QuestionGroup, attempt: Attempt, currPage: number, YPos: number};
  key: Keys;
  currAttempt: Attempt;
  incompleteAttempt: IncompleteAttempt;
  questionnaire: Questionnaire = {} as Questionnaire;
  groups: QuestionGroup[];

  tmp_user: User = {} as User;
  user_geoip: User = {} as User;
  isGeoReceived: boolean = false;

  currPageNumber: number = 1;
  totalPageNumber: number = 0;
  backBtnText: string = BtnsTextEnum.EXIT;
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
  isFinished: boolean = false;
  loading: boolean = true;
  showValidation: boolean = false;
  countryCode: string = '';

  private timerSubject$: Subject<void> = new Subject();
  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private titleService: Title,
    private store$: Store<RootStoreState.State>,
    private attemptService: AttemptService,
    private sessionStorageService: FreeAttemptSessionStorageService,
    private dataService: DataService,
    private tooltipService: TooltipService,
    private incompleteAttemptService: IncompleteAttemptService,
    private dialog: MatDialog
  ) {
    if (window && window.parent) {
      const fl = window.parent.frames.length;
    // if (!fl && top.location.hostname.toString() !== 'negotiations.com') {
      if (!fl) {
        window.location.href = 'https://www.negotiations.com/training/';
      }
    }
  }

  ngOnInit() {

    combineLatest(
      this.store$.select(state => state.attempt.key),
      this.store$.select(state => state.attempt.questionnaireId),
      this.store$.select(state => state.attempt.questions_groups)
    ).pipe(
      takeUntil(this.destroySubject$))
      .subscribe(([key, questionnaireId, groups]) => {
        if (key && groups && groups.length) {
          this.groups = JSON.parse(JSON.stringify(groups));
          this.totalPageNumber = groups.length;
          this.key = JSON.parse(JSON.stringify(key));

          this.getQuestionnaire(questionnaireId);

          const title = `${this.key.title} - ${this.questionnaire.title}`;
          this.titleService.setTitle( title );

          this.setTotalQuestionsCount();
          //this.getCurrentAttempt();
          //this.setAvalibleQuestions();

          window.addEventListener('message', this.handleParentMsg.bind(this), false);
          this.sendLoaded();
        }
      });
  }

  ngOnDestroy() {
    this.clearAttempt();
    window.removeEventListener('message', this.handleParentMsg.bind(this));
  }

  private clearAttempt() {
    if (this.destroySubject$) {
      this.destroySubject$.next();
      this.destroySubject$.complete();
    }
    if (this.timerSubject$) {
      this.timerSubject$.next();
      this.timerSubject$.complete();
    }

    if (this.isGeoReceived) {
      this.sessionStorageService.resetState();
    }

  }

  public handleParentMsg(e) {
    //if(event.origin !== 'https://www.negotiations.com') return;
   // console.log('*********from WP: ' + e);
    if (e.data) {

      try {
        const obj = e.data;
        if (obj && obj.action === 'visitorGeoIp') {
          this.isGeoReceived = true;
          this.user_geoip.last_location = obj.data.countryCode + ', ' + obj.data.city;
          this.user_geoip.ip = obj.data.ipAddress || '';
          this.user_geoip.isp = obj.data.traits ? obj.data.traits.isp || '' : '';
          this.user_geoip.city = obj.data.city || '';
          this.user_geoip.state_name = obj.data.region || '';
          this.countryCode = obj.data.countryCode || '';
          this.store$.pipe(
            take(1),
            select(SharedStoreSelectors.selectCountries)).subscribe((data: Country[]) => {
              if (obj.data.country) {
                const country: Country = data.find(c => c.name === obj.data.country);
                if (country) { this.user_geoip.country_id = country.id; }
              }
          });

          if (!this.incompleteAttempt) {
            const incAtt: IncompleteAttempt = {} as IncompleteAttempt;
            incAtt.questionnaire_id = this.questionnaire.id;
            incAtt.status = IncompleteAttemptStatus.STARTED;
            incAtt.ip = obj.data.ipAddress || '';
            incAtt.city = obj.data.city || '';
            incAtt.state = obj.data.region || '';
            incAtt.country = obj.data.country || '';
            incAtt.browser = navigator.userAgent;
            incAtt.responses = 0;
            this.createIncompleteAttempt(incAtt);
          }

          this.getCurrentAttempt();
          this.setAvalibleQuestions();
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  /**
   * Method retreives Questionnaire object from Key data
   * @param qId (questionnaire Id)
   */
  private getQuestionnaire(qId: number) {
    this.questionnaire = getQuestionnaireFromKey(qId, this.key);
    if (!this.questionnaire) {
      const msg = `Please reload the page, there's been a server error. Your data have been saved.`;
      this.openInformationDialog(msg, 'Error');
    }
  }

  /**
   * Get user answers from Session storage
   */
  private getCurrentAttempt() {
    const state: FreeAttemptData = this.sessionStorageService.getState();
    this.currAttempt = state.attempt;
    this.incompleteAttempt = state.incompleteAttempt;
    this.isFinished = state.isFinished;
    this.goToLastLocation();
    const timeLimit = this.questionnaire.incomplete_timeout * 60;
    this.passed_time = this.currAttempt.passed_time || 0;
    this.remaining_time = timeLimit - this.passed_time;
    this.tmp_user = state.user;
    this.currPageNumber = state.currPage;

    if (this.isFinished) {
      //this.createUserAndStoreResponses();
    } else {
      this.startTimer();
    }
  }

  private createIncompleteAttempt(attempt: IncompleteAttempt) {
    this.incompleteAttemptService.create(attempt).subscribe(
      (att: IncompleteAttempt) => {
        this.sessionStorageService.setIncompleteAttempt(att);
        this.incompleteAttempt = att;
      }, (err) => {
        const msg = `Please reload the page, there's been a server error.`;
        this.openInformationDialog(msg, 'Error');
        throw new Error('Start Free Attempt::incompleteAttemptService.create: ' + err);
      }
    );
  }

  /**
   * Save in sessionStorage and DB updated incomplete attempt (status and responses count)
   * @param completed (boolean)
   */
  private updateIncompleteAttempt(completed?: boolean) {
    if (!this.incompleteAttempt) {
      return;
    }

    if (completed) {
      this.incompleteAttempt.status = IncompleteAttemptStatus.COMPLETED;
    }

    this.incompleteAttempt.responses = this.sessionStorageService.getAnswersCount();
    this.incompleteAttemptService.update(this.incompleteAttempt).subscribe(
      (att: IncompleteAttempt) => {
        this.sessionStorageService.setIncompleteAttempt(this.incompleteAttempt);
      }, (err) => {
        const msg = `Please reload the page, there's been a server error.`;
        this.openInformationDialog(msg, 'Error');
        throw new Error('Start Free Attempt::incompleteAttemptService.update: ' + err);
      }
    );
  }

  private deleteIncompleteAttempt() {
    if (!this.incompleteAttempt) {
      return;
    }
    this.dataService.deleteIncompleteAttempts([this.incompleteAttempt.id]).subscribe(
      () => {
      }, (err) => {
        const msg = `Please reload the page, there's been a server error.`;
        this.openInformationDialog(msg, 'Error');
        throw new Error('Start Free Attempt::dataService.deleteIncompleteAttempts: ' + err);
      }
    );
  }

  /**
   * Sets data needed for rendering current page.
   */
  private setPageData() {
    this.data = {
      key: this.key, group: this.groups[this.currPageNumber - 1],
      attempt: this.currAttempt, currPage: this.currPageNumber, YPos: 0
    };
    setTimeout(() => {
      this.loading = false;
    }, 2);
  }

  /**
   * Retreives from local storage page number and Y position,
   * Sets stored page and cursor position as current.
   * Sets data needed for rendering current page.
   */
  private goToLastLocation() {
    const state: FreeAttemptData = this.sessionStorageService.getState();
    this.currPageNumber = state.currPage;
    this.setNextBtnText();
    this.setBackBtnText();
    this.data = {
      key: this.key, group: this.groups[this.currPageNumber - 1],
      attempt: this.currAttempt, currPage: this.currPageNumber, YPos: state.YPos
    };
    setTimeout(() => {
      this.loading = false;
    }, 10);
  }

  /**
   * Starts attempt's timer
   */
  private startTimer() {
    const timeLimit = this.questionnaire.incomplete_timeout * 60;
    this.passed_time = this.currAttempt.passed_time || 0;

    interval(1000).pipe(
      takeUntil(this.timerSubject$)
    ).subscribe(t => this.updateTimer(timeLimit));
  }

  /**
   * Updates remaining time and passed time every second.
   * And stores passed time to Session storage every 10 seconds.
   * @param timeLimit (time limit in seconds set for Questionnaire)
   */
  private updateTimer(timeLimit: number) {
    this.passed_time += 1;
    this.remaining_time = timeLimit - this.passed_time;
    if (this.passed_time % 5 === 0) {
      this.sessionStorageService.setPassedTime(this.passed_time);
    }
  }

  /**
   * Gets current attempt (Include answers with answer_options) by id.
   */
  private updateCurrentAttempt() {
    this.sessionStorageService.setCurrPage(this.currPageNumber);
    this.setPageData();
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

  private setBackBtnText() {
    this.backBtnText = this.currPageNumber === 1 ? BtnsTextEnum.EXIT : BtnsTextEnum.BACK;
  }

  /**
   * Returns to the prev page
   */
  onBack() {
    if (this.currPageNumber === 1) {
      if (!this.currAttempt || !this.currAttempt.answers.length) {
        this.clearAttempt();
        this.sendCloseFrame();
        return;
      }
      const text = 'Are you sure you want to leave the Assessment? All your responses will be lost.';
      const dialogRef = this.openConfirmationDialog(text, 'Confirm Exit');
      dialogRef.afterClosed()
        .pipe(takeUntil(this.destroySubject$))
        .subscribe((data: any) => {
          if (data) {
            this.clearAttempt();
            this.sendCloseFrame();
          }
        });
      return;
    } else {
      this.showValidation = true;
      this.loading = true;
      this.currPageNumber--;
      this.updateCurrentAttempt();
    }

    this.setNextBtnText();
    this.setBackBtnText();
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
      this.formInvalid = true;
      this.currPageNumber ++;
      this.updateCurrentAttempt();
    }

    this.setNextBtnText();
    this.setBackBtnText();
  }

  confirmFinishing() {
    if (!this.currAttempt || !this.currAttempt.answers.length) {
      const msg = `You have not answered a single question.`;
      this.openInformationDialog(msg, 'Please respond');
      return;
    }

    this.createUserAndStoreResponses();
    this.isFinished = true;
    this.sessionStorageService.setIsFinished(true);
  }

  /**
   * Sets formInvalid value
   * @param $event (boolean) form.valid value
   */
  onFormChanged($event) {
    this.formInvalid = !$event.formValid;
    this.firstInvalidId = $event.firstInvalidId;
    this.updateIncompleteAttempt();
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
      //this.tooltipService.reset();
      //this.tooltipService.createTooltip($event.target.parentElement, 'bottom', this.nextBtnTooltipText, 'error-tooltip', false);
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

  /**
   * Creates new attempt for Questionnaire.
   */
  private createAttempt(user: User) {
    const att = {
      user_id: user.id,
      questionnaire_id: this.questionnaire.id,
      status: QuestionnaireStatus.COMPLETED,
      passed_time: this.passed_time
    } as Attempt;

    this.attemptService.createAttempt(att)
    .subscribe ((attempt: Attempt) => {
      if (attempt) {
        this.storeResponses(attempt, user);
      }
     }, (err) => {
      this.loading = false;
      const msg = `Please reload the page, there's been a server error. Your data have been saved.`;
      this.openInformationDialog(msg, 'Error');
      throw new Error('Start Free Attempt::attemptService.createAttempt: ' + err);
     });
  }

  /**
   * Saves responses into the DB
   * @param attempt
   * @param user
   */
  private storeResponses(attempt: Attempt, user: User) {
    this.currAttempt.answers.forEach((answer: UserAnswer, index: number) => {
      const newAnswer: UserAnswer = {} as UserAnswer;
      newAnswer.attempt_id = attempt.id;
      newAnswer.question_id = answer.question_id;
      if (answer.answer) {
        newAnswer.answer = answer.answer;
      }
      if (answer.comment) {
        newAnswer.comment = answer.comment;
      }

      this.attemptService.createUserAnswer(newAnswer).subscribe(
        (answ: UserAnswer) => {
          if (answer.answer_options && answer.answer_options.length) {
            const options: UserAnswerOption[] = [];
            answer.answer_options.forEach((option: UserAnswerOption) => {
              option.answer_id = answ.id;
              options.push(option);
            });

            this.attemptService.createOrUpdateUserAnswerOptions(options, []).subscribe(
              (data: any) => {
                if (index === (this.currAttempt.answers.length - 1)) {
                  this.sendCompleteAndResEmail(attempt, user);
                }
              }, (err) => {
                this.loading = false;
                const msg = `Please reload the page, there's been a server error. Your data have been saved.`;
                this.openInformationDialog(msg, 'Error');
                throw new Error('Start Free Attempt::attemptService.createOrUpdateUserAnswerOptions: ' + err);
               }
            );
          }
          if (index === (this.currAttempt.answers.length - 1) &&
            (!answer.answer_options || !answer.answer_options.length)) {
              this.sendCompleteAndResEmail(attempt, user);
          }
        }, (err) => {
          this.loading = false;
          const msg = `Please reload the page, there's been a server error. Your data have been saved.`;
          this.openInformationDialog(msg, 'Error');
          throw new Error('Start Free Attempt::attemptService.createUserAnswer: ' + err);
         }
      );
    });
  }

  /**
   * Sends completion and result email
   * Delete incomplete attempt since it was finished and registered
   * @param attempt
   * @param user
   */
  private sendCompleteAndResEmail(attempt: Attempt, user: User) {
    const obj = {aId: attempt.id, uId: user.id, qId: this.questionnaire.id, kId: user.company_id, passed_time: this.passed_time};

    this.attemptService.completeAttemptSendRes(obj)
      .subscribe((data: any) => {
        this.loading = false;
        this.deleteIncompleteAttempt();
        this.sendSaveFrame(user, data.url);
      }, err => {
        this.loading = false;
        const msg = `Please reload the page, there's been a server error. Your data have been saved.`;
        this.openInformationDialog(msg, 'Error');
        throw new Error('Start Free Attempt::attemptService.completeAttemptSendRes: ' + err);
      });
  }

  /**
   * Open "Create new Participant" dialog.
   * If Registration finished - Creates new participant and stores participant responses into the DB
   */
  private createUserAndStoreResponses() {
    if (this.timerSubject$) {
      this.timerSubject$.next();
      this.timerSubject$.complete();
    }

    this.updateIncompleteAttempt(true);
    const dialogRef = this.openAddParticipantDialog('Personal info', 'add');
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: User) => {
        if (data) {
          this.loading = true;
          data.company_id = this.key.id;
          data = this.setUserGeoIp(data);
          this.dataService.findOrCreateUser(data).subscribe((user: User) => {
            this.store$.dispatch(new AttemptStoreActions.LoadUserAttemptsRequestAction(
              {uId: user.id, kId: this.key.id, qId: this.questionnaire.id}
            ));
            this.createAttempt(user);
          }, (err) => {
            this.loading = false;
            const msg = `Please reload the page, there's been a server error. Your data have been saved.`;
            this.openInformationDialog(msg, 'Error');
            throw new Error('Start Free Attempt::dataService.findOrCreateUser: ' + err);
           });
        }
      });
  }

  public onSizeChanged(event: any) {
    this.sendHeight();
  }

  private setUserGeoIp(user: User): User {
    if (this.user_geoip.last_location) { user.last_location = this.user_geoip.last_location; }
    if (this.user_geoip.ip) { user.ip = this.user_geoip.ip; }
    if (this.user_geoip.isp) { user.isp = this.user_geoip.isp; }
    if (this.user_geoip.city) { user.city = this.user_geoip.city; }
    if (this.user_geoip.state_name) { user.state_name = this.user_geoip.state_name; }
    if (this.user_geoip.country_id) { user.country_id = this.user_geoip.country_id; }

    return user;
  }

  private sendLoaded() {
    const pass_data = { action: 'loaded' };
    window.parent.postMessage(JSON.stringify(pass_data), '*');
  }

  private sendHeight() {
    const size = (<any>document.getElementsByClassName('page-content')[0]).offsetHeight;
    const pass_data = { 'action': 'iframeHeight' , size: (size + 152)};
    window.parent.postMessage(JSON.stringify(pass_data), '*');
  }

  private sendCloseFrame() {
    const pass_data = { action: 'iframeClose' };
    window.parent.postMessage(JSON.stringify(pass_data), '*');
  }

  private sendSaveFrame(user: User, resUrl: string) {
    const pass_data = {
      action: 'completed',
      email: user.email,
      firstName: user.first_name
     };
    window.parent.postMessage(JSON.stringify(pass_data), '*');
    const dialogRef = this.openFinalDialog('Congratulations', resUrl, this.questionnaire.title);

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        this.clearAttempt();
        this.sendCloseFrame();
      });
  }

  private openAddParticipantDialog(header: string, type: string): MatDialogRef<any> {
    const state: FreeAttemptData = this.sessionStorageService.getState();
    this.tmp_user = state.user;
    return this.dialog.open(RegDialogComponent, <any>{
      disableClose: true,
      width: '430px',
      data: {
        user: this.tmp_user,
        qId: this.questionnaire.id,
        countryCode: this.countryCode,
        header: header,
        type: type
      }
    });
  }

  private openFinalDialog(header: string, href: string, qName: string): MatDialogRef<any> {
    return this.dialog.open(FinalDialogComponent, <any>{
      disableClose: true,
      width: '430px',
      data: {
        header: header,
        href: href,
        qName: qName
      }
    });
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
