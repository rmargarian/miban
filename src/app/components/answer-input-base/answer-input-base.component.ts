import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, ValidationErrors} from '@angular/forms';
import {QuestionType} from '@app/enums';
import {TooltipService} from '@app/services/tooltip.service';

@Component({
  selector: 'app-answer-input-base',
  template: '',
  styleUrls: ['./answer-input-base.component.scss']
})
export class AnswerInputBaseComponent implements OnChanges {
  @Input() control: AbstractControl;
  @Input() commentControl: AbstractControl;

  @Input() answerOptions: any[];
  @Input() questionText: string;
  @Input() help: string;
  @Input() moreInfo: string;
  @Input() withComment: boolean;
  @Input() commentRows: number;
  @Input() isMandatory: boolean;
  @Input() explanation: string;
  @Input() type: QuestionType;
  @Input() labelText: string;
  @Input() validationErrors: ValidationErrors;
  @Input() align: boolean;
  @Input() notTooltip: boolean = false;

  tooltipPosition: string = 'bottom-start';

  errorMessage: string;

  constructor(public tooltipService: TooltipService) {
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (typeof changes.validationErrors !== 'undefined' &&
      changes.validationErrors.currentValue !== changes.validationErrors.previousValue) {
      const error = changes.validationErrors.currentValue;
      if (error && error.required) {
        this.errorMessage = 'Please choose';
      } else if (error && error.requiredOptions) {
        this.errorMessage = 'Not enough options selected';
      } else if (error && error.oneOption) {
        this.errorMessage = 'Please choose';
      } else if (error && error.allOptions) {
        this.errorMessage = 'Please choose';
      } else if (error && error.order) {
        this.errorMessage = 'Please set the order for all options';
      } else {
        this.errorMessage = undefined;
      }
      if (!changes.validationErrors.isFirstChange()) {
        setTimeout(() => {
          this.tooltipService.refreshTooltip();
        });
      }
    }
  }
}
