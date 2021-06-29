import {Component, Input, OnInit} from '@angular/core';

import { QuestionGraphType } from '@app/enums';

export enum Answer {
  STRING,
  GRAPH
}

@Component({
  selector: 'app-answers-renderer',
  templateUrl: './answers-renderer.component.html',
  styleUrls: ['./answers-renderer.component.scss']
})
export class AnswersRendererComponent implements OnInit {
  @Input() answers;
  @Input() parentRef;
  @Input() usersInfoMap;
  @Input() enableTooltip = true;
  @Input() showHeader: boolean;
  @Input() questionGraphType;
  @Input() hideEmptyResponses: boolean = true;
  @Input() color = '#94AE0A';

  public showType;
  public AnswerType = Answer;
  public graphType = QuestionGraphType;

  constructor() {
  }

  ngOnInit() {
    this.switchType(this.answers);
  }

  /**
   * function which checks what type of answer comes
   * than set value to a variable
   * @param arr
   */
  private switchType(arr): void {
    if (arr[0].hasOwnProperty('chart')) {
      this.showType = this.AnswerType.GRAPH;
    } else {
      this.showType = this.AnswerType.STRING;
    }
  }

}
