import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { QuestionnaireStatus } from '@app/enums';
import { Attempt } from '@app/models';

/**
 * Component renders status of Questionnaires for each User
 */
@Component({
  selector: 'app-status-renderer',
  templateUrl: './status-renderer.component.html',
  styleUrls: ['./status-renderer.component.scss']
})
export class StatusRendererComponent implements ICellRendererAngularComp {

  params: any;
  status = '';
  icon = '';
  time: string = '';
  attempt: Attempt = {} as Attempt;
  tooltip = '';

  constructor() {
  }

  agInit(params: any): void {
    this.params = params;
    this.time = params.data.time;
    if (params.data.attempts) {
      this.attempt = params.data.attempts[0];
    } else {
      this.attempt = {status: QuestionnaireStatus.COMPLETED} as Attempt;
    }

    this.setStatus();
  }

  private setStatus() {
    switch (this.attempt.status) {
      case QuestionnaireStatus.OPEN:
      case QuestionnaireStatus.REOPENED:
        this.status = 'Open';
        this.icon = 'unlock';
        break;
      case QuestionnaireStatus.STARTED_REGISTER:
        this.status = 'Started';
        this.icon = 'hourglass-start';
        break;
      case QuestionnaireStatus.COMPLETED:
      case QuestionnaireStatus.TIMEOUT:
      default:
        this.status = '';
        break;
    }
  }

  /**
   * Call refresh() method from ParticipantsComponent
   */
  private invokeParentMethod() {
    this.params.context.componentParent.refresh();
  }

  /**
   * Required for implementation ICellRendererAngularComp interface
   */
  refresh(): boolean {
    return false;
  }

}
