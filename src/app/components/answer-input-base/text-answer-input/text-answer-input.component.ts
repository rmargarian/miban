import { Component, OnInit } from '@angular/core';
import {AnswerInputBaseComponent} from '@app/components/answer-input-base/answer-input-base.component';

@Component({
  selector: 'app-text-answer-input',
  templateUrl: './text-answer-input.component.html',
  styleUrls: ['./text-answer-input.component.scss']
})
export class TextAnswerInputComponent extends AnswerInputBaseComponent implements OnInit {


  ngOnInit() {

  }

}
