import { Component, Input, OnInit } from '@angular/core';
import { GraphsBaseComponent } from '@app/_reports/components/graphs/graphs-base/graphs-base.component';
import { QuestionnaireType } from '@app/enums/questionnaire-type';

@Component({
  selector: 'app-text-answer',
  templateUrl: './text-answer.component.html',
  styleUrls: ['./text-answer.component.scss']
})
export class TextAnswerComponent extends GraphsBaseComponent implements OnInit {

  @Input() showHeader: string;

  ngOnInit() {
    if (!this.toolTip) {
      this.toolTip = this.createAndAppendTooltip();
    }
    this.data.forEach(answer => {
      // remove extra line breaks
      if (answer.comment) {
        // At the middle
        answer.comment = answer.comment.replace(/((\r\n|\r|\n){2})(\r\n|\r|\n)+/g, '$1');
        // At the start and at the end
        answer.comment = answer.comment.replace(/^\s+|\s+$/g, '');
      }
      const splited = answer.comment.split('\n');

      answer.spleted = answer.comment ? splited : null;
    });
  }

  onMouseOver($event, answer) {
    if (!this.enableTooltip) { return; }
    const delegateObj = answer.hasOwnProperty('delegateId') ?
        this.usersInfoMap.get(answer.delegateId) : this.usersInfoMap.get(answer.participantId);

    let userInfoString = this.formatUserInfo(delegateObj.user || delegateObj);
    // Add score to end of users' info
    if (delegateObj.questionnaireType === QuestionnaireType.ASSESSMENT ||
      delegateObj.questionnaireType === QuestionnaireType.FEEDBACK) {
        userInfoString += ' - ' + delegateObj.score;
    }
    if (delegateObj.questionnaireType === QuestionnaireType.ASSESSMENT) {
      userInfoString += '%';
    }

    this.toolTip
          .style('left', $event.pageX - 50 + 'px')
          .style('top', $event.pageY - 70 + 'px')
          .style('display', 'inline-block')
          .html(userInfoString);
  }

  onMouseMove($event, answer) {
    if (!this.enableTooltip) { return; }
    const delegateObj = answer.hasOwnProperty('delegateId') ?
        this.usersInfoMap.get(answer.delegateId) : this.usersInfoMap.get(answer.participantId);

    let userInfoString = this.formatUserInfo(delegateObj.user || delegateObj);
    // Add score to end of users' info
    if (delegateObj.questionnaireType === QuestionnaireType.ASSESSMENT ||
      delegateObj.questionnaireType === QuestionnaireType.FEEDBACK) {
        userInfoString += ' - ' + delegateObj.score;
    }
    if (delegateObj.questionnaireType === QuestionnaireType.ASSESSMENT) {
      userInfoString += '%';
    }

    this.toolTip
          .style('left', $event.pageX - 50 + 'px')
          .style('top', $event.pageY - 70 + 'px')
          .style('display', 'inline-block')
          .html(userInfoString);
  }

  onMouseOut($event, answer) {
    if (!this.enableTooltip) { return; }
    this.toolTip.style('display', 'none');
  }

}
