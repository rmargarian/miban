import { Component, OnInit, OnDestroy, Input, Output, AfterViewInit, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';

import { FreeAttemptSessionStorageService } from '@app/_user/services';
import {
  Keys,
  QuestionGroup,
  Attempt,
  UserAnswer,
  UserAnswerOption,
  QuestionAnswerOption,
  Question
} from '@app/models';
import { QuestionType } from '@app/enums';

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
  selector: 'app-group-page-free',
  templateUrl: './group-page-free.component.html',
  styleUrls: ['./group-page-free.component.scss']
})
export class GroupPageFreeComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  set data(data: { key: Keys, group: QuestionGroup, attempt: Attempt, currPage: number, YPos: number }) {
    if (!data) return;
    try {
      document.getElementsByTagName('app-user')[0].scrollTo(0, 0);
    } catch (error) {

    }

    this.key = data.key;
    this.group = data.group;
    this.currAttempt = data.attempt;
    this.currPage = data.currPage;
    this.YPos = data.YPos;
    this.init();
  }
  @Input() showValidation: boolean = false;
  @Output() formChanged = new EventEmitter();
  @Output() sizeChanged = new EventEmitter();

  form: FormGroup;
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
    private sessionStorageService: FreeAttemptSessionStorageService
  ) { }


  ngOnInit() {
  }

  ngAfterViewInit() {
    this.questionControlsMap.forEach((map: QuestionControlsMap) => {
      map.control.valueChanges
        .pipe(takeUntil(this.destroySubject$))
        .subscribe(control => {
          this.findOrCreateAnswer(map.question, control, map.isComment);
        });
    });
    try {
      document.getElementsByTagName('app-user')[0].scrollTo(0, this.YPos);
    } catch (error) {

    }

    setTimeout(() => {
      this.sizeChanged.emit();
    }, 100);

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
      let valid = true;
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key) && this.form.controls[key].invalid) {
          valid = false;
          break;
        }
      }
      for (const key in controls) {
        if (controls.hasOwnProperty(key) && controls[key].invalid) {
          this.formChanged.emit({formValid: valid, firstInvalidId: key, isStarted: isStarted});
          return;
        }
      }

      this.formChanged.emit({formValid: valid, firstInvalidId: '', isStarted: isStarted});
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
      //questions_map.question.title = questions_map.question.title.replace(/{TOKEN CURRENCY}/g, this.user.curr.currency);
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
    if (userAnswer && userAnswer.answer_options && userAnswer.answer_options.length) {
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
    if (userAnswer && userAnswer.answer_options && userAnswer.answer_options.length) {
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
    if (userAnswer && userAnswer.answer_options && userAnswer.answer_options.length) {
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
   * Update user's answer in session storage
   * @param answer (new UserAnswer)
   */
  private storeUserAnswer(answer: UserAnswer) {
    this.sessionStorageService.updateUserAnswer(answer);
  }

  /**
   * Create or update user's answer options
   * @param options (UserAnswerOption array)
   */
  private storeUserAnswerOptions(options: UserAnswerOption[], question_id: number) {
    this.sessionStorageService.createOrUpdateUserAnswerOptions(options, question_id);
  }

  /**
   * Finds or creates UserAnswer
   * @param question (Question on which user is answered)
   * @param answer (UserAnswer)
   * @param isComment (boolean: is comment updated)
   */
  private findOrCreateAnswer(question: Question, answer: any, isComment?: boolean) {
    const YPos = document.getElementsByTagName('app-user')[0].scrollTop;
    this.sessionStorageService.setqYPos(YPos);

    const newAnswer: UserAnswer = {} as UserAnswer;
    newAnswer.question_id = question.id;

    const storedAnsw: UserAnswer = this.sessionStorageService.findOrcreateUserAnswer(newAnswer);
    if (isComment) {
      storedAnsw.comment = answer;
      this.storeUserAnswer(storedAnsw);
      return;
    }
    this.configureAnswer(question, answer, storedAnsw);
    this.emitFormChanges(true);
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
        for (const key in answer) {
          if (answer.hasOwnProperty(key) && answer[key] && parseInt(key, 10)) {
            const answOption = {} as UserAnswerOption;
            answOption.question_answer_options_id = parseInt(key, 10);
            answOption.label_set_options_id = 0;
            answOption.user_order_pos = 0;
            answerOptions.push(answOption);
          }
        }
        this.storeUserAnswerOptions(answerOptions, question.id);
        break;
      }
      case QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION:
      {
        answerOptions = [];
        const answOption = {} as UserAnswerOption;
        answOption.question_answer_options_id = answer;
        answOption.label_set_options_id = 0;
        answOption.user_order_pos = 0;
        answerOptions.push(answOption);
        this.storeUserAnswerOptions(answerOptions, question.id);
        break;
      }
      case this.QuestionType.ARRAY:
      {
        answerOptions = [];
        for (const key in answer) {
          if (answer.hasOwnProperty(key) && answer[key]) {
            const answOption = {} as UserAnswerOption;
            answOption.question_answer_options_id = parseInt(key, 10);
            answOption.label_set_options_id = answer[key];
            answOption.user_order_pos = 0;
            answerOptions.push(answOption);
          }
        }
        this.storeUserAnswerOptions(answerOptions, question.id);
        break;
      }
      case this.QuestionType.ORDER:
      {
        answerOptions = [];
        answer.forEach((element: QuestionAnswerOption, index: number) => {
          const answOption = {} as UserAnswerOption;
          answOption.question_answer_options_id = element.id;
          answOption.label_set_options_id = 0;
          answOption.user_order_pos = index;
         // answOption.answer_id = userAnswer.id;
          answerOptions.push(answOption);
        });
        this.storeUserAnswerOptions(answerOptions, question.id);
        break;
      }
    }
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }
}
