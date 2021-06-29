import { Component, OnInit, OnDestroy, Input, Output, AfterViewInit, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import {
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';

import { RootStoreState, AttemptStoreActions } from '@app/root-store';
import { AttemptService, SessionStorageService } from '@app/_user/services';
import {
  User,
  Keys,
  QuestionGroup,
  Attempt,
  UserAnswer,
  UserAnswerOption,
  QuestionAnswerOption,
  Question
} from '@app/models';
import { QuestionnaireStatus, QuestionType } from '@app/enums';
import { UserRoutesEnum } from '@app/_user/enums';
import { AttemptData } from '../../../models';

import { MultiOptionsControl, MultiOptionsTypeRequiredValidator } from '@app/components/answer-input-base/multi-choices-multi-options';
import { ArrayControl, ArrayTypeRequiredValidator } from '@app/components/answer-input-base/array-answer-input';
import { OrderTypeRequiredValidator } from '@app/components/answer-input-base/order-answer';

interface QuestionControlsMap {
  question: Question;
  control: FormControl;
  isComment: boolean;
}
/**
 * Class responsible for rendering group with questions
 */
@Component({
  selector: 'app-group-page',
  templateUrl: './group-page.component.html',
  styleUrls: ['./group-page.component.scss']
})
export class GroupPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  set data(data: { key: Keys, user: User, group: QuestionGroup, attempt: Attempt, currPage: number, YPos: number }) {
    if (!data) return;

    try {
      document.getElementsByTagName('app-user')[0].scrollTo(0, 0);
    } catch (error) {

    }

    this.user = data.user;
    this.key = data.key;
    this.group = data.group;
    this.currAttempt = data.attempt;
    this.currPage = data.currPage;
    this.YPos = data.YPos;
    this.init();
    this.storeStateToSessionStorage();
  }
  @Input() showValidation: boolean = false;
  @Input() isAdmin: boolean = false;
  @Output() formChanged = new EventEmitter();

  form: FormGroup;
  user: User = {} as User;
  key: Keys;
  group: QuestionGroup;
  currAttempt: Attempt;
  currPage: number;
  YPos: number = 0;

  questionControlsMap: QuestionControlsMap[] = [];

  QuestionType = QuestionType;
  checklistItemsForm: FormGroup;
  commentControl: FormControl;

  validating: boolean = false;

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private attemptService: AttemptService,
    private sessionStorageService: SessionStorageService,
    private store$: Store<RootStoreState.State>
  ) { }


  ngOnInit() {
  }

  ngAfterViewInit() {
    this.questionControlsMap.forEach((map: QuestionControlsMap) => {
      if (map.question.type === QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS) {
        map.control.valueChanges
        .pipe(
          distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
          debounceTime(100),
          takeUntil(this.destroySubject$))
        .subscribe(control => {
          this.findOrCreateAnswer(map.question, control, map.isComment);
        });
      } else if ((<any>map.control).controls) {
        for (const key in (<any>map.control).controls) {
          if ((<any>map.control).controls.hasOwnProperty(key)) {
            (<any>map.control).controls[key].valueChanges
            .pipe(
              takeUntil(this.destroySubject$), 
              distinctUntilChanged(),
              debounceTime(100)
            ).subscribe(control => {
              const obj = {};
              obj[key] = control;
              this.findOrCreateAnswer(map.question, obj, map.isComment);
            });
          }
        }
      } else {
        map.control.valueChanges
        .pipe(
          takeUntil(this.destroySubject$), 
          debounceTime(100))
        .subscribe(control => {
          this.findOrCreateAnswer(map.question, control, map.isComment);
        });
      }
    });
    try {
      document.getElementsByTagName('app-user')[0].scrollTo(0, this.YPos);
    } catch (error) {

    }
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  private init() {
    this.form = this.createGroup();
    this.emitFormChanges(false);
  }

  private emitFormChanges(isStarted: boolean) {
    if (this.form) {
      const controls = this.form.controls;
      for (const key in controls) {
        if (controls.hasOwnProperty(key) && controls[key].invalid) {
          this.formChanged.emit({formValid: this.form.valid, firstInvalidId: key, isStarted: isStarted});
          return;
        }
      }

      this.formChanged.emit({formValid: this.form.valid, firstInvalidId: '', isStarted: isStarted});
    }
  }

  /**
   * Method finds (and returns) Answer in current Attempt
   * @param questionId (Question id)
   */
  private findUserAnswer(questionId: number): UserAnswer {
    if (!this.currAttempt || !this.currAttempt.answers) return null;
    for (const answer of this.currAttempt.answers) {
      if (answer.question_id === questionId) {
          return answer;
        }
    }
    return null;
  }

  /**
   * Method initiates form by adding controls,
   * Adds validators and
   * Adds subscriptions on controls value Change event
   */
  createGroup() {
    const group = this.formBuilder.group({});
    this.group.group_questions_map.forEach(questions_map => {
      const userAnswer: UserAnswer = this.findUserAnswer(questions_map['question'].id);
      if (this.user.curr) {
        questions_map.question.title = questions_map.question.title.replace(/{TOKEN CURRENCY}/g, this.user.curr.currency);
      }

      if (questions_map['question'].question_answer_options) {
        questions_map['question'].question_answer_options.sort((a, b) => a.order_pos - b.order_pos);
      }
      let fControl: FormControl = new FormControl();

      let validator = questions_map['question'].is_mandatory ? Validators.required : null;

      switch (questions_map['question'].type) {
        case QuestionType.NUMERIC:
          fControl = new FormControl(userAnswer ? userAnswer.answer : '', validator);
          break;
        case QuestionType.TEXT:
          fControl = new FormControl(userAnswer ? userAnswer.comment : '', validator);
          break;
        case QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS:
          const options = this.getChosenOptions(userAnswer);
          const min = questions_map.question.min_selected_options;
          validator = questions_map['question'].is_mandatory ? MultiOptionsTypeRequiredValidator(min) : null;
          fControl = (<any>new MultiOptionsControl(questions_map['question'].question_answer_options,
            options, 'id', validator));
          break;
        case QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION:
          let option;
          if (userAnswer && userAnswer.answer_options.length) {
            option = userAnswer.answer_options[0].question_answer_options_id;
          }
          fControl = new FormControl(option, validator);
          break;
        case QuestionType.SLIDER:
          fControl = new FormControl(userAnswer ? userAnswer.answer : '', validator);
          if (questions_map['question'].sliderTags.length !== 0) {
            questions_map['question'].sliderTags.forEach(tag => {
              if (tag.is_default === 1) {
                fControl.setValue(tag);
              }
            });
          }
          break;
        case this.QuestionType.ARRAY:
          const pairOptions = this.getChosenOptionsForArray(userAnswer);
          validator = questions_map['question'].is_mandatory ? ArrayTypeRequiredValidator : null;
          fControl = (<any>new ArrayControl(questions_map['question'].question_answer_options,
            pairOptions, validator));
          break;
        case this.QuestionType.ORDER:
          const orderedOptions = this.getChosenOptionsForOrder(userAnswer, questions_map['question'].question_answer_options);
          validator = questions_map['question'].is_mandatory ?
            OrderTypeRequiredValidator(questions_map['question'].question_answer_options) : null;
          fControl = new FormControl(orderedOptions, validator);
          break;
      }

      this.questionControlsMap.push({
        question: questions_map.question,
        control: fControl,
        isComment: false
      });

      group.addControl(questions_map['question'].id.toString(), fControl);
      /**Add contol for comments */
      if (questions_map.question.is_commented) {
        const commentControl = new FormControl(userAnswer ? userAnswer.comment : '');
        this.questionControlsMap.push({
          question: questions_map.question,
          control: commentControl,
          isComment: true
        });
        group.addControl(questions_map['question'].id.toString() + '_comment', commentControl);
      }
    });
    return group;
  }

  /**
   * Returns array with chosen (by user) options ids
   * @param userAnswer (UserAnswer)
   */
  private getChosenOptions(userAnswer: UserAnswer): number[] {
    const options: number[] = [];
    if (userAnswer && userAnswer.answer_options.length) {
      userAnswer.answer_options.forEach((option: UserAnswerOption) => {
        options.push(option.question_answer_options_id);
      });
    }
    return options;
  }

  /**
   * Returns array with chosen (by user) options pairs
   * {question_answer_options_id, label_set_options_id}
   * @param userAnswer (UserAnswer)
   */
  private getChosenOptionsForArray(userAnswer: UserAnswer): any[] {
    const options: any[] = [];
    if (userAnswer && userAnswer.answer_options.length) {
      userAnswer.answer_options.forEach((option: UserAnswerOption) => {
        options.push({
          question_answer_options_id: option.question_answer_options_id,
          label_set_options_id: option.label_set_options_id});
      });
    }
    return options;
  }

  /**
   * Returns QuestionAnswerOption array chosen by user
   * @param userAnswer (UserAnswer)
   * @param question_answer_options (QuestionAnswerOption[])
   */
  private getChosenOptionsForOrder(userAnswer: UserAnswer, question_answer_options: QuestionAnswerOption[]): any[] {
    const opts = JSON.parse(JSON.stringify(question_answer_options));
    const options: QuestionAnswerOption[] = [];
    if (userAnswer && userAnswer.answer_options.length) {
      userAnswer.answer_options.forEach((option: UserAnswerOption) => {
        const obj: QuestionAnswerOption = opts.find((q_a_opt) => (q_a_opt.id === option.question_answer_options_id) );
        if (obj) {
          obj.order_pos = option.user_order_pos;
          options.push(obj);
        }
      });
    }
    options.sort((a, b) => a.order_pos - b.order_pos);
    return options;
  }

  /**
   * Calls api to update user's answer in DB
   * @param answer (new UserAnswer)
   */
  private storeUserAnswer(answer: UserAnswer) {
      this.attemptService.updateUserAnswer(answer).subscribe(
        (data: UserAnswer) => {

        }, err => {
          throw new Error('Start Attempt::storeUserAnswer: ' + err);
        }
      );
  }

  /**
   * Calls api to create or update user's answer options
   * CREATE if options item doesn't contain 'id'
   * @param options (UserAnswerOption array)
   */
  private storeUserAnswerOptions(options: UserAnswerOption[], delete_ids: number[]) {
    this.attemptService.createOrUpdateUserAnswerOptions(options, delete_ids).subscribe(
      (data: any) => {
      }, err => {
        throw new Error('Start Attempt::storeUserAnswerOptions: ' + err);
      }
    );
  }

  /**
   * Finds or creates UserAnswer
   * @param question (Question on which user is answered)
   * @param answer (UserAnswer)
   * @param isComment (boolean: is comment updated)
   */
  private findOrCreateAnswer(question: Question, answer: any, isComment?: boolean) {
    this.attemptService.getAttemptById(this.currAttempt.id).subscribe(
      (att) => {
        if (att.status === QuestionnaireStatus.COMPLETED && !this.isAdmin) {
          const queryParams = { kId: this.key.id, qId: this.currAttempt.questionnaire_id, uId: this.user.id };
          this.store$.dispatch(new AttemptStoreActions.NavigateAction({ path: UserRoutesEnum.AUTHENTICATE, queryParams: queryParams }));
          return;
        }

        const newAnswer: UserAnswer = {} as UserAnswer;
        newAnswer.attempt_id = this.currAttempt.id;
        newAnswer.question_id = question.id;
        this.storeStateToSessionStorage();

        this.attemptService.findOrcreateUserAnswer(newAnswer).subscribe(
          (data: UserAnswer) => {
            if (isComment) {
              data.comment = answer;
              this.storeUserAnswer(data);
              return;
            }
            this.configureAnswer(question, answer, data);
            this.emitFormChanges(true);
          }, err => {
            throw new Error('Start Attempt::findOrcreateUserAnswer: ' + err);
          }
        );
        
      },
      (err) => {
        throw new Error('Start Attempt::attemptService.getAttemptById: ' + err);
    });
  }

  /**
   * Stores to session storage current page number and Y position,
   * plus questionnaire id, user id and key id to compare if stored attempt is
   * equal to current.
   */
  private storeStateToSessionStorage() {
    const state: AttemptData = {} as AttemptData;
    state.kId = this.key.id;
    state.uId = this.user.id;
    state.qId = this.group.questionnaire_id;
    state.currPage = this.currPage;
    state.YPos = document.getElementsByTagName('app-user')[0].scrollTop;
    this.sessionStorageService.saveState(state);
  }

  /**
   * Configures UserAnswer object or UserAnswerOption array (depending on question type)
   * and calls api to store answer in DB
   * @param question (Question on which user is answered)
   * @param answer (new user's answer)
   * @param userAnswer (stored user's answer)
   */
  private configureAnswer(question: Question, answer: any, userAnswer: UserAnswer) {
    let answerOptions: UserAnswerOption[] = [];
    switch (question.type) {
      case QuestionType.NUMERIC:
        userAnswer.answer = answer;
        this.storeUserAnswer(userAnswer);
        break;
      case QuestionType.SLIDER:
        userAnswer.answer = answer;
        this.storeUserAnswer(userAnswer);
        break;
      case QuestionType.TEXT:
        userAnswer.comment = answer;
        this.storeUserAnswer(userAnswer);
        break;
      case QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS:
      {
        answerOptions = [];
        const delete_ids: number[] = [];
        for (const key in answer) {
          if (answer.hasOwnProperty(key) && answer[key] && parseInt(key, 10)) {
            let savedOption: UserAnswerOption;
            /**Search in saved user answer options */
            if (userAnswer.answer_options) {
              savedOption = userAnswer.answer_options.find(
                option => option.question_answer_options_id === parseInt(key, 10)
              );
            }
            if (savedOption) { continue; }
            const answOption = {} as UserAnswerOption;
            answOption.question_answer_options_id = parseInt(key, 10);
            answOption.label_set_options_id = 0;
            answOption.user_order_pos = 0;
            answOption.answer_id = userAnswer.id;
            answerOptions.push(answOption);
          } else if (answer.hasOwnProperty(key) && !answer[key]) {
            if (userAnswer.answer_options) {
              /**Configure array with options ids to remove */
              userAnswer.answer_options.forEach((opt: UserAnswerOption) => {
                if (opt.question_answer_options_id === parseInt(key, 10)) {
                  delete_ids.push(opt.id);
                }
              });
            }
          }
        }
        if (answerOptions.length || delete_ids.length) {
          this.storeUserAnswerOptions(answerOptions, delete_ids);
        }
        break;
      }
      case QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION:
      {
        answerOptions = [];
        let savedOption: UserAnswerOption;
        if (userAnswer.answer_options && userAnswer.answer_options.length) {
          savedOption = userAnswer.answer_options[0];
        }
        const answOption = savedOption || {} as UserAnswerOption;
        answOption.question_answer_options_id = answer;
        answOption.label_set_options_id = 0;
        answOption.user_order_pos = 0;
        answOption.answer_id = userAnswer.id;
        answerOptions.push(answOption);
        this.storeUserAnswerOptions(answerOptions, []);
        break;
      }
      case this.QuestionType.ARRAY:
      {
        answerOptions = [];
        for (const key in answer) {
          if (answer.hasOwnProperty(key) && answer[key]) {
            let savedOption: UserAnswerOption;
            /**Search in saved user answer options */
            if (userAnswer.answer_options) {
              savedOption = userAnswer.answer_options.find(
                option => option.question_answer_options_id === parseInt(key, 10)
              );
            }
            const answOption = savedOption || {} as UserAnswerOption;
            answOption.question_answer_options_id = parseInt(key, 10);
            answOption.label_set_options_id = answer[key];
            answOption.user_order_pos = 0;
            answOption.answer_id = userAnswer.id;
            answerOptions.push(answOption);
          }
        }
        this.storeUserAnswerOptions(answerOptions, []);
        break;
      }
      case this.QuestionType.ORDER:
      {
        answerOptions = [];
       
        answer.forEach((element: QuestionAnswerOption, index: number) => {
          let savedOption: UserAnswerOption;
          //Search in saved user answer options 
          if (userAnswer.answer_options) {
            savedOption = userAnswer.answer_options.find(
              option => option.question_answer_options_id === element.id
            );
          }
          const answOption = savedOption || {} as UserAnswerOption;
          answOption.question_answer_options_id = element.id;
          answOption.label_set_options_id = 0;
          answOption.user_order_pos = index;
          answOption.answer_id = userAnswer.id;
          answerOptions.push(answOption);
        });
        /**Configure array with options ids to remove */
        const delete_ids: number[] = [];
        if (userAnswer.answer_options) {
          userAnswer.answer_options.forEach((opt: UserAnswerOption) => {
            const obj = answerOptions.find(option => option.id === opt.id);
            if (!obj) { delete_ids.push(opt.id); }
          });
        }
        this.storeUserAnswerOptions(answerOptions, delete_ids);
        break;
      }
    }
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }
}
