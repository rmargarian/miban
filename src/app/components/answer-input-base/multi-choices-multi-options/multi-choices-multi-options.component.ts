import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  AnswerInputWithOptionsBaseComponent
} from '@app/components/answer-input-base/answer-input-with-options-base/answer-input-with-options-base.component';

@Component({
  selector: 'app-multi-choices-multi-options',
  templateUrl: './multi-choices-multi-options.component.html',
  styleUrls: ['./multi-choices-multi-options.component.scss']
})
export class MultiChoicesMultiOptionsComponent extends AnswerInputWithOptionsBaseComponent implements OnInit {
  @Input() align: boolean;
  @Input() min_selected: number;
  @Input() max_selected: number;
  @Input() control: FormArray;

  isMaxSelected: boolean = false;

  ngOnInit() {
    this.setDisabled();
  }

  change() {
    this.setDisabled();
  }

  /**
   * Sets isMaxSelected value (true/false) to disable not selected options
   * if max limit for selection has been exceeded
   */
  private setDisabled() {
    let selectedCount = 0;
    for (const key in this.control.value) {
      if (this.control.value.hasOwnProperty(key) && this.control.value[key]) {
        selectedCount++;
      }
    }

    this.isMaxSelected = selectedCount === this.max_selected ? true : false;

    if (this.isMaxSelected) {
      for (const key in this.control.value) {
        if (this.control.value.hasOwnProperty(key) && !this.control.value[key]) {
          const action = this.control.value[key] ? 'enable' : 'disable';
          this.control.controls[key][action]();
        }
      }
    } else {
      for (const key in this.control.controls) {
        if (this.control.controls.hasOwnProperty(key)) {
          this.control.controls[key].enable();
        }
      }
    }
  }
}
