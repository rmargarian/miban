import {Component, Input, OnInit} from '@angular/core';
import {AnswerInputBaseComponent} from "@app/components/answer-input-base/answer-input-base.component";
import { FormGroup, FormControl, Validators} from '@angular/forms';
import {AnswerInputWithOptionsBaseComponent} from "@app/components/answer-input-base/answer-input-with-options-base/answer-input-with-options-base.component";

@Component({
  selector: 'app-multi-choices-single-option',
  templateUrl: './multi-choices-single-option.component.html',
  styleUrls: ['./multi-choices-single-option.component.scss']
})
export class MultiChoicesSingleOptionComponent extends AnswerInputWithOptionsBaseComponent {
  @Input() align: boolean;
}
