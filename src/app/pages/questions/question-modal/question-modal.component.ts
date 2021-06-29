import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Observable, Subject } from 'rxjs';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, delay, takeUntil } from 'rxjs/internal/operators';

import { DialogComponent } from '../../../components/dialog/dialog.component';
import { QuestionType, OptionColumnInputType, QuestionGraphType } from '@app/enums';
import { OptionColumn } from '@app/components/options-editor/option-column';
import { ConfirmationDialogComponent } from '@app/components';
import { LabelSetEditorDialogComponent } from '@app/pages/questions/label-set-editor-dialog/label-set-editor-dialog.component';
import { PreviewDialogComponent } from '@app/components/dialog/preview-dialog/preview-dialog.component';
import { Question } from '@app/models';

declare function setCloneSuffix(field, count, postfix): any;

@Component({
  selector: 'app-question-modal',
  templateUrl: './question-modal.component.html',
  styleUrls: ['./question-modal.component.scss', '../../../components/dialog/dialog.component.scss']
})
export class QuestionModalComponent extends DialogComponent implements OnInit {
  originTitle: string = '';
  dialogType: string = '';
  usedInData: string = '';

  header: string;
  questionTypes = [];
  QuestionType = QuestionType;
  sliderTags: any[];
  questionAnswerColumns: OptionColumn[];
  sliderColumns: OptionColumn[];
  disabledConfigBlock: boolean = true;
  options: any[];
  question_answer_options: any[];
  sliderOptionValidator: boolean;
  additionalForm: FormGroup;
  private minmaxValidator: boolean;
  minValidator: boolean = true;
  validating: boolean = true;
  showValidation: boolean = false;

  private optionsChanged: boolean = false;
  private answerOptionRequiredValid: boolean;
  private destroyAdditionalFormSubscriptions$: Subject<void> = new Subject();

  ngOnInit() {

    this.dialogRef.backdropClick().subscribe(_ => {
      this.onClose();
    });
    this.dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.keyCode === this.keyCodes.ESCAPE) {
        event.preventDefault();
        this.onClose();
      }
    });
    this.dialogType = this.data.modalType;
    this.header = this.data.header;
    /**
     * Setup custom labels options editor columns
     * @type {[OptionColumn , OptionColumn , OptionColumn]}
     */
    this.sliderColumns = [
      new OptionColumn(OptionColumnInputType.TEXT, 'value', true, 1, 'Value'),
      new OptionColumn(OptionColumnInputType.TEXT, 'tag', false, 1, 'Label'),
      new OptionColumn(OptionColumnInputType.RADIO, 'is_default', false, 0, '', this.setCustomLabelDefaultValue.bind(this))
    ];

    if (this.data.modalType === 'add') {
      this.question_answer_options = [];
      this.sliderTags = [];
    } else if (this.data.modalType === 'clone' || this.data.modalType === 'copy') {
      this.addPostfix(' - Clone');
    }

    if (this.data.modalType === 'edit'
      || this.data.modalType === 'clone'
      || this.data.modalType === 'copy') {
      this.originTitle = this.data.question.title;
      this.setSliderTags();
      if (!this.data.question.question_answer_options) {
        this.question_answer_options = [];
      } else {
        const opts = JSON.parse(JSON.stringify(this.data.question.question_answer_options));
        opts.sort((a, b) => {
          return a.order_pos - b.order_pos;
        });
        this.question_answer_options = opts;
      }
    }

    if (this.data.modalType === 'edit') {
      this.usedInData = this.getUsedIn(this.data.question, this.data.question.title);
    }

    this.questionTypes = this.questionService.getQuestionnairesType();

    this.data.quest_type = this.questionService.getQuestionnairesType();

    this.data.type = this.questionService.getQuestionAnswerType();

    // Set available graph types depend on question type
    if (this.data.question && this.data.question.type === QuestionType.ARRAY) {
      this.data.graph_type = this.questionService.getQuestionGraphTypeforArray();
    } else if (this.data.question &&
      (this.data.question.type === QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS ||
      this.data.question.type === QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION)) {
      this.data.graph_type = this.questionService.getQuestionGraphTypeforMulti();
    } else if (this.data.question && this.data.question.type === QuestionType.ORDER) {
      this.data.graph_type = this.questionService.getQuestionGraphTypeForOrder();
    } else {
      this.data.graph_type = this.questionService.getDefaultQuestionGraphType();
    }

    this.data.sliderModes = [
      {text: 'Custom labels', id: 1},
      {text: 'Range', id: 2}
    ];

    this.questionService.getLabelSetOptions().subscribe(labels_options => {
      this.data.labelSet = labels_options;
    });

    if (!this.data.question) {
      this.data.question = {};
    }

    this.form = this.formBuilder.group({
      'title': [this.data.question.title, Validators.required, this.validateTitleNotTaken.bind(this)],
      'help': [this.data.question.help],
      'more_info': [this.data.question.more_info],
      'quest_type': [this.data.question.quest_type, Validators.required],
      'type': [this.data.question.type, Validators.required],
      // 'display_labels': [this.data.question.show_labels],
      'show_labels': [this.data.question.show_labels],
      // 'display_values_as_tooltips': [this.data.question.show_tooltips],
      'show_tooltips': [this.data.question.show_tooltips],
      'is_commented': [this.data.question.is_commented],
      'comment_row': [this.data.question.comment_row ? this.data.question.comment_row : 1],
      'comment_label': [this.data.question.comment_label],
      'is_comment_label': [this.data.question.is_comment_label],
      'is_active': [this.data.question.is_active],
      'is_bonus': [this.data.question.is_bonus],
      'is_cloud': [this.data.question.is_cloud === undefined ? true : this.data.question.is_cloud],
      'is_sort_hide': [this.data.question.is_sort_hide === undefined ? false : this.data.question.is_sort_hide],
      'is_faces': [this.data.question.is_faces],
      'is_mandatory': [this.data.question.is_mandatory],
      'is_vertical_alig': [this.data.question.is_vertical_alig],
      'question_graph_type': [this.data.question.question_graph_type || QuestionGraphType.BAR, Validators.required],
      'explanation': [this.data.question.explanation]
    });

    this.setupFormByType(this.data.question.type);
    this.form.controls['type'].valueChanges.subscribe((questionType: QuestionType) => {
      this.setupFormByType(questionType);
    });
    this.form.controls['title'].valueChanges.subscribe((value: string) => {
      this.usedInData = this.getUsedIn(this.data.question, value);
    });
  }

  /**
   * Validates title is not taken.
   * And allows (in 'edit' and 'copy' cases) to leave the same title.
   */
  private validateTitleNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    if (!this.form) {
      return new Observable(null);
    }

    this.validating = true;
    return this.questionService.isTitleValid(control.value)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;
          const sameTitle = (this.data.question.title === control.value &&
            (this.data.modalType === 'edit' || this.data.modalType === 'copy')) ? true : false;
          let resp;
          if (this.data.question.title) {
            resp = (sameTitle || res) ? null : {questionTitleTaken: true};
          } else {
            resp = (res) ? null : {questionTitleTaken: true};
          }
          return resp;
        }));
  }

  private addPostfix(postfix: string) {
    this.questionService.getFieldUnicueCloneCount('title', this.data.question.title).subscribe((count: number) => {
      this.getControl('title').setValue(setCloneSuffix(this.data.question.title, count, postfix));
    });
  }

  /**
   * Returns string with Questionnaires titles (separated by comma) in which Question is used.
   * @param data (Question)
   * @param newTitle (question's title)
   */
  private getUsedIn(data: Question, newTitle: string): string {
    const questions_map = data.question_groups_questions_map;
    if (!questions_map || !(this.data.modalType === 'edit'
        || (this.data.modalType === 'copy' && this.originTitle === newTitle))) {
      return '';
    }
    const questinnairesList = [];
    questions_map.forEach(quest_map => {
      if (quest_map.question_group.questionnaire && !quest_map.question_group.questionnaire.deleted) {
        questinnairesList.push(quest_map.question_group.questionnaire.title);
      }
    });
    const titles = questinnairesList.join(', ');
    return titles;
  }

  /**
   * Custom angular validator for min field
   * @param {AbstractControl} c
   * @returns {{maxRange: boolean}}
   */
  private minNumberValidator(c: AbstractControl): { maxRange: boolean } {
    const maxFieldType = 'max_selected_options';
    let invalid = false;
    if (c.parent && c.parent.controls[maxFieldType].value) {
      invalid = parseInt(c.value, 10) > parseInt(c.parent.controls[maxFieldType].value, 10);
      if ((invalid && c.parent.controls[maxFieldType].valid) || (!invalid && !c.parent.controls[maxFieldType].valid)) {
        setTimeout(() => {
          c.parent.controls[maxFieldType].updateValueAndValidity();
        });
      }
    }

    invalid ? this.minmaxValidator = false : this.minmaxValidator = true;
    return invalid ? {maxRange: invalid} : null;
  }


  /**
   * Custom angular validator for max field
   * @param {AbstractControl} c
   * @returns {{minRange: boolean}}
   */
  private maxNumberValidator(c: AbstractControl): { minRange: boolean } {
    const minFieldType = 'min_selected_options';
    let invalid = false;
    if (c.parent && c.parent.controls[minFieldType].value) {
      invalid = parseInt(c.value, 10) < parseInt(c.parent.controls['min_selected_options'].value, 10);
      if ((invalid && c.parent.controls[minFieldType].valid) || (!invalid && !c.parent.controls[minFieldType].valid)) {
        setTimeout(() => {
          c.parent.controls[minFieldType].updateValueAndValidity();
        });
      }
    }
    return invalid ? {minRange: invalid} : null;
  }

  /**
   * Options editor validator to prevent collisions with min field value if there  is any.
   * @returns {boolean}
   */
  private minValidation(): boolean {
    if (this.question_answer_options
      && this.question_answer_options.length > 0
      && this.additionalForm
      && this.additionalForm.controls['min_selected_options'].value) {
      return this.question_answer_options.length >= this.additionalForm.controls['min_selected_options'].value;
    } else if (this.additionalForm && this.additionalForm.controls['min_selected_options'].value) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Default slider options for slider question type with custom labels
   */
  generateFirstDefaultSliders() {
    return [
      {value: '', tag: '', is_default: true, position: 0},
      {value: '', tag: '', is_default: false, position: 1}
    ];
  }

  /**
   * Setup slider tags. Get from server if there was a question or add defaults
   */
  setSliderTags() {
    if (this.data.question.hasOwnProperty('id')) {
      this.questionService.getSliderTags(this.data.question.id).subscribe(sliderTags => {
        if (sliderTags.length > 0) {
          this.sliderTags = sliderTags;
          this.sliderTags.forEach(tag => {
            tag.is_default === '1' ? tag.is_default = true : tag.is_default = false;
          });
        } else {
          this.sliderTags = this.generateFirstDefaultSliders();
        }
      });
    } else {
      this.sliderTags = this.generateFirstDefaultSliders();
    }
  }

  /**
   * Set default label to true, rest to false
   * @param value
   * @param option
   * @param fieldName
   */
  setCustomLabelDefaultValue(value, option, fieldName) {
    this.sliderTags.forEach(tag => {
      tag[fieldName] = tag === option;
    });
    this.sliderTags = this.sliderTags.slice();
  }

  /**
   * Add new custom slider label
   * @param newOption
   */
  addSliderLabel(newOption) {
    newOption.value = '';
    newOption.tag = '';
    newOption.is_default = false;
    newOption.position = this.sliderTags.length;
    this.sliderTags.push(newOption);
    this.sliderTags = this.sliderTags.slice();
    this.setOptionsChanged(true);
  }

  /**
   * Handle custom slider labels drag and drop
   * @param options
   */
  changeSliderOrderPosition(options) {
    for (let i = 0; i < options.length; i++) {
      options[i].position = i;
    }
    this.sliderTags = options;
    this.sliderTags = this.sliderTags.slice();
    this.setOptionsChanged(true);
  }

  /**
   * Remove new custom slider label
   * @param optionToRemove
   */
  removeSliderLabel(optionToRemove) {
    this.sliderTags.splice(optionToRemove.position, 1);
    this.resetSliderCustomLabelsOrderPositionsByIndex();
    if (this.sliderTags && this.sliderTags.length > 0) {
      /**
       * Set first custom label option default if we delete previous default one
       */
      const enabledCheckedField = this.sliderTags.find((key) => (key.is_default === true));
      if (!enabledCheckedField) {
        this.sliderTags[0].is_default = true;
      }
    }
    this.sliderTags = this.sliderTags.slice();
    this.setOptionsChanged(true);
  }

  private resetSliderCustomLabelsOrderPositionsByIndex() {
    for (let i = 0; i < this.sliderTags.length; i++) {
      this.sliderTags[i].position = i;
    }
  }

  isQuestionWithOptions(questionType: QuestionType): boolean {
    return questionType === QuestionType.ORDER ||
      questionType === QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS ||
      questionType === QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION ||
      questionType === QuestionType.ARRAY;
  }

  isQuestionWithScoredOptions(questionType: QuestionType): boolean {
    return questionType === QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION ||
      questionType === QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS;
  }

  /**
   * Add question answer option
   * @param newOption
   */
  addOption(newOption) {
    newOption.score = 0;
    newOption.title = '';
    newOption.order_pos = this.question_answer_options.length + 1;
    this.question_answer_options.push(newOption);
    this.minValidator = this.minValidation();
    this.setOptionsChanged(true);
  }

  /**
   * Remove question answer option
   * @param optionToDelete
   */
  removeOption(optionToDelete) {
    this.question_answer_options.splice(this.question_answer_options.indexOf(optionToDelete), 1);
    this.resetOptionsOrderPositionsByIndex();
    // this.question_answer_options = this.question_answer_options.slice();
    this.minValidator = this.minValidation();
    this.setOptionsChanged(true);
  }

  onChangeOption() {
    this.setOptionsChanged(true);
  }

  /**
   * Handle question answer options drag end drop
   * @param options
   */
  changeOrderPosition(options) {
    for (let i = 0; i < options.length; i++) {
      options[i].order_pos = i + 1;
    }
    this.question_answer_options = options;
    this.setOptionsChanged(true);
  }

  /**
   * Check if all question answer options are passing validation
   * @param {boolean} value
   */
  validationEmitter(value: boolean) {
    this.answerOptionRequiredValid = value;
  }

  /**
   * Check if all slider custom labels are passing validation
   * @param {boolean} value
   */
  sliderValidationEmitter(value: boolean) {
    this.sliderOptionValidator = value;
  }

  /**
   * Allow user to save questions only id following conditions passed
   * @returns {boolean}
   */
  checkModalValidity(): boolean {
    if (!this.disabledConfigBlock && this.question_answer_options.length) {
      for (const option of this.question_answer_options) {
        if (!option.title) { return false; }
      }
    }
    if (this.form.controls['type'].value) {
      switch (this.form.controls['type'].value) {
        case this.QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION:
        case this.QuestionType.ORDER: {
          return this.form.valid && this.answerOptionRequiredValid;
        }
        case this.QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS: {
          return this.form.valid && this.answerOptionRequiredValid && this.minmaxValidator && this.minValidator;
        }
        case this.QuestionType.ARRAY: {
          return this.form.valid && this.additionalForm.valid && this.answerOptionRequiredValid;
        }
        case this.QuestionType.SLIDER: {
          if (this.additionalForm.controls['slider_mode'].value === 1) {
            return this.form.valid && this.additionalForm.valid && this.sliderOptionValidator;
          } else if (this.additionalForm.controls['slider_mode'].value === 2) {
            return this.form.valid && this.additionalForm.valid;
          } else {
            return false;
          }
        }
        case this.QuestionType.TEXT: {
          return this.form.valid;
        }
        case this.QuestionType.NUMERIC: {
          return this.form.valid;
        }
      }
    } else {
      return false;
    }

    return true;
  }

  private resetOptionsOrderPositionsByIndex() {
    for (let i = 0; i < this.question_answer_options.length; i++) {
      this.question_answer_options[i].order_pos = i + 1;
    }
  }

  /**
   *
   * @param {QuestionType} questionType
   */
  private setupFormByType(questionType: QuestionType) {
    if (this.isQuestionWithOptions(questionType)) {
      this.disabledConfigBlock = false;
      /**
       * Create answer option columns for editor
       * @type {[OptionColumn , OptionColumn]}
       */
      if (this.isQuestionWithScoredOptions(questionType)) {
        this.questionAnswerColumns = [
          new OptionColumn(OptionColumnInputType.TEXT, 'title', true, 4),
          new OptionColumn(OptionColumnInputType.NUMBER, 'score', false, 1),
        ];
      } else {
        this.questionAnswerColumns = [new OptionColumn(OptionColumnInputType.TEXT, 'title', true)];
      }
    } else {
      this.disabledConfigBlock = true;
    }

    /**
     * Set correct graph types in select
     */
    if (this.form && this.form.controls['type'].value !== QuestionType.ARRAY) {
      this.data.graph_type = this.questionService.getDefaultQuestionGraphType();
      this.form.controls['question_graph_type'].setValue(this.data.question.question_graph_type || QuestionGraphType.BAR);
      /**
       * If radar was picked reset to bar
       */
      if (this.form.controls['question_graph_type'].value === QuestionGraphType.RADAR) {
        this.form.controls['question_graph_type'].setValue(QuestionGraphType.BAR);
      }
    } else {
      this.data.graph_type = this.questionService.getQuestionGraphTypeforArray();
      this.form.controls['question_graph_type'].setValue(this.data.question.question_graph_type || QuestionGraphType.BAR);
    }

    /**
     * Setup additional form for inputs specific to some of the questions types
     */
    this.form.controls['quest_type'].enable();
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS:
        this.data.graph_type = this.questionService.getQuestionGraphTypeforMulti();
        this.form.controls['question_graph_type'].setValue(this.data.question.question_graph_type || QuestionGraphType.BAR);
        this.createMultiOptionsTypeAdditionalForm();
        this.additionalForm.controls['min_selected_options'].valueChanges.subscribe(min_change => {
          this.minValidator = this.minValidation();
        });
        break;
      case QuestionType.ARRAY: {
        this.createArrayTypeAdditionalForm();
        break;
      }
      case QuestionType.SLIDER:
        this.setSliderTags();
        this.createSliderTypeAdditionalForm();
        break;
      case QuestionType.TEXT:
      case QuestionType.NUMERIC:
        break;
      case QuestionType.ORDER:
        this.data.graph_type = this.questionService.getQuestionGraphTypeForOrder();
        break;
      case QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION:
        this.data.graph_type = this.questionService.getQuestionGraphTypeforMulti();
        this.form.controls['question_graph_type'].setValue(this.data.question.question_graph_type || QuestionGraphType.BAR);
        this.destroyAdditionalForm();
        break;
      // default:
      //   throw new Error('There is no such QuestionType: ' + questionType);
    }
  }

  /**
   * Add new label set to database for Array question type
   */
  addLabelSet() {
    const dialogRef = this.openLabelSetEditorDialog('add');
    dialogRef.afterClosed().subscribe(data => {
      this.questionService.createNewLabelSet(data).subscribe(() => {
        this.refreshLabelSets();
      });
    });
  }

  /**
   * Edit an existing label set in database for Array question type
   * @param {number} labelId
   */
  editLabelSet(labelId: number) {
    this.questionService.getOptionsByLabelSetId(labelId).subscribe(optionsByLabel => {
      const dialogRef = this.openLabelSetEditorDialog('edit', this.getLabelTitleById(labelId), optionsByLabel);
      dialogRef.afterClosed().subscribe(updatedLabelSet => {
        updatedLabelSet.id = labelId;
        this.questionService.updateLabelSet(updatedLabelSet).subscribe(() => {
          this.refreshLabelSets();
        });
      });
    });
  }

  /**
   * Delete an existing label set in database for Array question type
   * @param {number} id
   */
  deleteLabelSet(id: number) {
    const dialogRef = this.openDeleteConfirmationDialog();
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.additionalForm.controls['label_set_id'].setValue('');
        this.questionService.deleteLabelSet(id).subscribe(() => {
          this.refreshLabelSets();
        });
      }
    });
  }

  /**
   * Fetch all label sets from database
   */
  private refreshLabelSets() {
    this.questionService.getLabelSetOptions().subscribe(labelSetOptions => {
      this.data.labelSet = labelSetOptions;
    });
  }

  private getLabelTitleById(id: number) {
    for (let i = 0; i < this.data.labelSet.length; i++) {
      if (this.data.labelSet[i].id === id) {
        return this.data.labelSet[i].title;
      }
    }
  }

  /**
   * Prepare new question information from form, additional form, question answer options and trigger
   * event emitter with that data
   */
  save() {
    this.showValidation = true;
    if (!this.checkModalValidity()) { return; }

    if (this.isQuestionWithOptions(this.form.controls['type'].value)) {
      if (!this.isQuestionWithScoredOptions(this.form.controls['type'].value)) {
        this.question_answer_options.forEach(option => {
          delete option.score;
        });
      }
      this.form.addControl('question_answer_options', new FormControl(this.question_answer_options));
    }

    if (this.form.controls['type'].value === this.QuestionType.SLIDER) {
      if (this.question_answer_options) {
        this.question_answer_options = [];
      }
      if (this.additionalForm.controls['slider_mode'].value === 1) {
        this.additionalForm.removeControl('range_percentages');
        this.additionalForm.removeControl('range_from_value');
        this.additionalForm.removeControl('range_to_value');
        this.additionalForm.removeControl('range_from_tag');
        this.additionalForm.removeControl('range_to_tag');
        this.form.value.slider_tags = this.sliderTags;
      }
    } else if (this.form.controls['type'].value === this.QuestionType.TEXT || this.QuestionType.NUMERIC) {
      this.form.removeControl('range_percentages');
      this.form.removeControl('range_from_value');
      this.form.removeControl('range_to_value');
      this.form.removeControl('range_from_tag');
      this.form.removeControl('range_to_tag');
    }


    this.form.value.id = this.data.question.id;
    let formData;
    if (this.additionalForm) {
      formData = Object.assign({}, this.form.value, this.additionalForm.value);
    } else {
      formData = Object.assign({}, this.form.value);
    }

    this.closeDialog(formData);
  }

  private setOptionsChanged(value: boolean) {
    this.optionsChanged = value;
  }

  /**
   * Pass data and open preview
   */
  openPreview() {
    this.showValidation = true;
    if (!this.checkModalValidity()) { return; }

    let formValue, dialogRef;

    if (this.additionalForm) {
      formValue = Object.assign(this.form.value, this.additionalForm.value);
    } else {
      formValue = this.form.value;
    }

    const dialogData = {
      formValue: formValue,
      question_answer_options: this.question_answer_options,
      sliderTags: this.sliderTags,
      labelSetOptions: undefined
    };

    if (this.additionalForm && this.additionalForm.controls.label_set_id && this.additionalForm.controls.label_set_id.value) {
      this.questionService.getOptionsByLabelSetId(this.additionalForm.controls.label_set_id.value).subscribe(optionsByLabel => {
        dialogData.labelSetOptions = optionsByLabel;
        dialogRef = this.dialog.open(PreviewDialogComponent, <any> {
          width: '800px',
          data: dialogData
        });
      });
    } else {
      dialogRef = this.dialog.open(PreviewDialogComponent, <any> {
        width: '800px',
        data: dialogData
      });
    }
  }

  private createSliderTypeAdditionalForm() {
    this.destroyAdditionalForm();
    this.additionalForm = this.formBuilder.group({
      'slider_mode': [this.data.question.slider_mode, Validators.required],
      'range_interval': [this.data.question.range_interval ? this.data.question.range_interval : 1, Validators.required]
    });
    this.switchSliderModeControls();

    this.additionalForm.controls['slider_mode']
      .valueChanges
      .pipe(takeUntil(this.destroyAdditionalFormSubscriptions$))
      .subscribe(() => {
        this.switchSliderModeControls();
      });

    this.additionalForm.controls['range_interval']
      .valueChanges
      .pipe(takeUntil(this.destroyAdditionalFormSubscriptions$))
      .subscribe(changedRange => {
        if (changedRange <= 0) {
          this.additionalForm.controls['range_interval'].setValue('');
        }
      });
  }

  private createMultiOptionsTypeAdditionalForm() {
    this.destroyAdditionalForm();
    this.additionalForm = this.formBuilder.group({
      'min_selected_options': [this.data.question.min_selected_options, this.minNumberValidator.bind(this)],
      'max_selected_options': [this.data.question.max_selected_options, this.maxNumberValidator.bind(this)],
    });
  }

  private createArrayTypeAdditionalForm() {
    this.destroyAdditionalForm();
    this.additionalForm = this.formBuilder.group({
      'label_set_id': [this.data.question.label_set_id, Validators.required]
    });
  }

  private destroyAdditionalForm() {
    if (this.additionalForm) {
      this.destroyAdditionalFormSubscriptions$.next();
      this.destroyAdditionalFormSubscriptions$.complete();
      this.additionalForm = undefined;
    }
  }

  private switchSliderModeControls() {
    if (!this.additionalForm) return;

    if (this.additionalForm.controls['slider_mode'].value === 1) {
      this.additionalForm.removeControl('range_percentages');
      this.additionalForm.removeControl('range_from_value');
      this.additionalForm.removeControl('range_to_value');
      this.additionalForm.removeControl('range_from_tag');
      this.additionalForm.removeControl('range_to_tag');
    } else if (this.additionalForm.controls['slider_mode'].value === 2) {
      this.additionalForm.addControl('range_percentages', new FormControl(this.data.question.range_percentages));
      this.additionalForm.addControl('range_from_value', new FormControl(this.data.question.range_from_value, Validators.required));
      this.additionalForm.addControl('range_to_value', new FormControl(this.data.question.range_to_value, Validators.required));
      this.additionalForm.addControl('range_from_tag', new FormControl(this.data.question.range_from_tag));
      this.additionalForm.addControl('range_to_tag', new FormControl(this.data.question.range_to_tag));
    }
  }

  private openLabelSetEditorDialog(type: string, title?: string, labelsInfo?: any[]): MatDialogRef<any> {
    return this.dialog.open(LabelSetEditorDialogComponent, <any>{
      width: '550px',
      data: {
        labelsInfo: labelsInfo,
        header: 'Question Label Set Editor',
        type: type,
        title: title
      }
    });
  }

  onClose() {
    if (!this.form.pristine || (this.additionalForm && !this.additionalForm.pristine) || this.optionsChanged) {
      const dialogRef = this.openCloseConfirmationDialog();
      dialogRef.afterClosed()
        .subscribe((data: any) => {
          if (data) {
            this.closeDialog();
          }
        });
    } else {
      this.closeDialog();
    }
  }

  private openDeleteConfirmationDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '400px',
      data: {
        title: 'Confirmation Delete',
        text: 'Are you sure you want to delete this Label Set?'
      }
    });
  }

  private openCloseConfirmationDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '530px',
      data: {
        title: 'Confirmation Close',
        text: 'You have some unsaved changes. Are you sure you want to close the editor?'
      }
    });
  }

}
