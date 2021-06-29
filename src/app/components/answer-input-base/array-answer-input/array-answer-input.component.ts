import { Component, OnInit, Input } from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  AnswerInputWithOptionsBaseComponent
} from '@app/components/answer-input-base/answer-input-with-options-base/answer-input-with-options-base.component';

@Component({
  selector: 'app-array-answer-input',
  templateUrl: './array-answer-input.component.html',
  styleUrls: ['./array-answer-input.component.scss']
})
export class ArrayAnswerInputComponent extends AnswerInputWithOptionsBaseComponent implements OnInit {
  @Input() control: FormArray;
  @Input() labelSetOptions: any[];
  @Input() labelSetOptionTextField: string = 'value';
  @Input() labelSetOptionValueField: string = 'id';

  ngOnInit() {
  }

}
