import { Component, OnInit, Input } from '@angular/core';
import { AnswerInputBaseComponent } from '@app/components/answer-input-base/answer-input-base.component';
import { isIE, getMobileOperatingSystem } from '@app/utils';

@Component({
  selector: 'app-answer-wrapper',
  templateUrl: './answer-wrapper.component.html',
  styleUrls: ['./answer-wrapper.component.scss']
})
export class AnswerWrapperComponent extends AnswerInputBaseComponent implements OnInit {

  @Input() showTextArea: boolean;
  @Input() min_selected: number;

  ngOnInit() {
  }

}
