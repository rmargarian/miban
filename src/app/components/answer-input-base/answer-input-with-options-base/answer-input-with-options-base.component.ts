import { Component, OnInit, Input } from '@angular/core';
import { AnswerInputBaseComponent } from '@app/components/answer-input-base/answer-input-base.component';

@Component({
  selector: 'app-answer-input-with-options-base',
  templateUrl: './answer-input-with-options-base.component.html',
  styleUrls: ['./answer-input-with-options-base.component.scss']
})
export class AnswerInputWithOptionsBaseComponent extends AnswerInputBaseComponent implements OnInit {
  @Input() options: any[];
  @Input() textField: string = 'title';
  @Input() valueField: string = 'id';
  ngOnInit() { }

}
