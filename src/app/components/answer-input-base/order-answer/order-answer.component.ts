import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  AnswerInputWithOptionsBaseComponent
} from '@app/components/answer-input-base/answer-input-with-options-base/answer-input-with-options-base.component';
import { TypeContainerChoices } from '@app/components/answer-input-base/order-answer/index';

import { QuestionAnswerOption } from '@app/models';

@Component({
  selector: 'app-order-answer',
  templateUrl: './order-answer.component.html',
  styleUrls: ['./order-answer.component.scss']
})
export class OrderAnswerComponent extends AnswerInputWithOptionsBaseComponent implements OnInit {
  public originOptions: QuestionAnswerOption[];
  public orderedOptions: QuestionAnswerOption[] = [];

  public selectedUnOrderedOption: QuestionAnswerOption;
  public selectedOrderedOption: QuestionAnswerOption;
  TypeContainerChoices = TypeContainerChoices;
  @Input() control: AbstractControl;

  public static moveOption(fromOptionArr, toOptionArr, option) {
    const choiceIndex = fromOptionArr.indexOf(option);
    if (fromOptionArr[choiceIndex].hasOwnProperty('hided') && fromOptionArr[choiceIndex].hided) {
      const index = toOptionArr.map((e) => e.id).indexOf(fromOptionArr[choiceIndex].id);
      toOptionArr[index].hided = false;
      fromOptionArr.splice(choiceIndex, 1);
    } else {
      fromOptionArr[choiceIndex].hided = true;
      toOptionArr.push(option);
    }
  }

  ngOnInit() {
    this.originOptions = JSON.parse(JSON.stringify(this.options));
    this.orderedOptions = this.control.value || [];

    if (this.orderedOptions.length > 0) {
      this.orderedOptions.forEach(option => {
        const pos = this.options.map((e) => e.id).indexOf(option.id);

        if (pos !== -1) {
          option.hided = true;
          this.options[pos].hided = true;
        }
      });
    }
  }

  public showSelectedSlot(option: QuestionAnswerOption, type: TypeContainerChoices) {
    if (type === TypeContainerChoices.YourChoices) {
      this.selectedUnOrderedOption = option;
      this.selectedOrderedOption = undefined;
    }

    if (type === TypeContainerChoices.YourRanking) {
      this.selectedOrderedOption = option;
      this.selectedUnOrderedOption = undefined;
    }
  }

  public selectedSlotChoice(option: QuestionAnswerOption, type: TypeContainerChoices) {
    this.selectedUnOrderedOption = undefined;
    this.selectedOrderedOption = undefined;

    if (type === TypeContainerChoices.YourChoices) {
      this.addOption(option);
    } else if (type === TypeContainerChoices.YourRanking) {
      OrderAnswerComponent.moveOption(this.orderedOptions, this.options, option);
      this.control.setValue(this.orderedOptions);
    }
  }

  private addOption(option: QuestionAnswerOption) {
    if ((this.orderedOptions.find(o => o.id === option.id)) || !option) {
      return;
    }
    if ((this.orderedOptions.find(o => o.id === option.id)) || !option) {
      return;
    }

    OrderAnswerComponent.moveOption(this.options, this.orderedOptions, option);
    this.selectedUnOrderedOption = undefined;
    this.selectedOrderedOption = undefined;
    // Select first at the top of ordered option
    if (this.options.length !== this.orderedOptions.length) {
      const selectedPos = option.order_pos;
      let newSelection;
      this.originOptions.forEach((opt: QuestionAnswerOption) => {
        const obj = this.orderedOptions.find(oopt => oopt.id === opt.id);
        // if option is not ordered yet and position less then just selected
        if (!obj && opt.order_pos < selectedPos) {
          newSelection = JSON.parse(JSON.stringify(opt));
          // if we are passed the selected position and didn't find upper option, then selected the bottom one
        } else if (!obj && !newSelection) {
          newSelection = JSON.parse(JSON.stringify(opt));
          return;
        }
      });

      this.selectedUnOrderedOption = this.options.find(o => o.id === newSelection.id);
    }

    if (this.options.length === this.orderedOptions.length) {
      this.selectedOrderedOption = this.orderedOptions[this.orderedOptions.length - 1];
    }

    this.control.setValue(this.orderedOptions);
  }

  public moveSelectedSlotChoice(option: QuestionAnswerOption, direction: string) {
    let previousOption;

    const index = this.orderedOptions.indexOf(option);
    if (direction === 'top') {
      previousOption = this.orderedOptions[index - 1];
      this.orderedOptions[index - 1] = this.orderedOptions[index];
    } else if (direction === 'bottom') {
      previousOption = this.orderedOptions[index + 1];
      this.orderedOptions[index + 1] = this.orderedOptions[index];
    }
    this.orderedOptions[index] = previousOption;
    this.control.setValue(this.orderedOptions);
  }
}
