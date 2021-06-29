import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogComponent } from '@app/components';
import { QuestionType } from '@app/enums';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MultiOptionsControl,
  MultiOptionsTypeRequiredValidator
} from '../../answer-input-base/multi-choices-multi-options';
import { ArrayControl, ArrayTypeRequiredValidator } from '../../answer-input-base/array-answer-input';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderTypeRequiredValidator } from '@app/components/answer-input-base/order-answer';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.scss']
})
export class PreviewDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  QuestionType = QuestionType;
  checklistItemsForm: FormGroup;

  destroySubject$ = new ReplaySubject(1);

  ngOnInit() {
    switch (this.data.formValue.type) {
      case this.QuestionType.TEXT:
        this.checklistItemsForm = this.formBuilder.group({
          'text': new FormControl('', Validators.required)
        });
        this.checklistItemsForm.controls['text']
          .valueChanges
          .pipe(takeUntil(this.destroySubject$))
          .subscribe(value => {
          });
        break;
      case this.QuestionType.NUMERIC:
        this.checklistItemsForm = this.formBuilder.group({
          'number': new FormControl('', Validators.required),
          'commentControl': new FormControl('')
        });
        this.checklistItemsForm.controls['number']
          .valueChanges
          .pipe(takeUntil(this.destroySubject$))
          .subscribe(value => {
          });
        break;
      case this.QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION:
        this.checklistItemsForm = this.formBuilder.group({
          'singleOption': new FormControl('', Validators.required),
          'commentControl': new FormControl('')
        });
        this.checklistItemsForm.controls['singleOption']
          .valueChanges
          .pipe(takeUntil(this.destroySubject$))
          .subscribe(value => {
          });
        break;
      case this.QuestionType.SLIDER:
        this.checklistItemsForm = this.formBuilder.group({
          'sliderControl': new FormControl('', Validators.required),
          'commentControl': new FormControl('')
        });
        if (this.data.sliderTags.length !== 0) {
          this.data.sliderTags.forEach(tag => {
            if (tag.is_default === true) {
              this.checklistItemsForm.controls['sliderControl'].setValue(tag);
            }
          });
        }
        this.checklistItemsForm.controls['sliderControl']
          .valueChanges
          .pipe(takeUntil(this.destroySubject$))
          .subscribe(value => {
          });
        break;
      case this.QuestionType.MULTIPLE_CHOISE_MULTI_OPTIONS:
        this.checklistItemsForm = this.formBuilder.group({
          'multipleOptions':  new MultiOptionsControl(this.data.question_answer_options, [], 'id', MultiOptionsTypeRequiredValidator(0)),
          'commentControl': new FormControl('')
        });
        this.checklistItemsForm.controls['multipleOptions']
          .valueChanges
          .pipe(takeUntil(this.destroySubject$))
          .subscribe(value => {
          });
        break;
      case this.QuestionType.ARRAY:
        this.checklistItemsForm = this.formBuilder.group({
          'arrayControl': new ArrayControl(this.data.question_answer_options, [], ArrayTypeRequiredValidator),
          'commentControl': new FormControl('')
        });
        this.checklistItemsForm.controls['arrayControl']
          .valueChanges
          .pipe(takeUntil(this.destroySubject$))
          .subscribe(value => {
          });
        break;
      case this.QuestionType.ORDER:
        this.checklistItemsForm = this.formBuilder.group({
          'orderOptionControl': new FormControl([], OrderTypeRequiredValidator(this.data.question_answer_options)),
          'commentControl': new FormControl('')
        });
        break;
    }
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

}
