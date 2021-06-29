import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ConfirmationDialogComponent, InformationDialogComponent } from '@app/components';
import { UserQuestionnaireContact, Attempt, UserQuestionnaireAttemptsLimit } from '@app/models';
import { UserService, DataService } from '@app/services';
import { QuestionnaireStatus } from '@app/enums';
import { DeleteAttemptComponent } from '../delete-attempt/delete-attempt.component';

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
  checked = true;
  attempts: any[] = [];
  headerName = '';
  attempts_limit = 1;

  showStatusTooltip = false;
  statusTooltip = '';
  tooltip = '';

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private dialog: MatDialog) {
  }

  agInit(params: any): void {
    this.params = params;
    this.headerName = params.colDef.headerName;
    this.status = '';
    this.attempts = params.data.attempts.filter((a: Attempt) => a.questionnaire_id === params.colDef.id);
    const limit = params.data.u_q_limit.filter((a: UserQuestionnaireAttemptsLimit) => a.id_questionnaire === params.colDef.id);
    if (limit.length > 0) {
      this.attempts_limit = limit[0].attempts_limit;
    }
    this.renderer();
  }

  private renderer() {
    if (this.attempts_limit > 1) {
      this.showStatusTooltip = true;
      this.attempts.forEach((element, index) => {
        switch (element.status) {
          case QuestionnaireStatus.OPEN:
          case QuestionnaireStatus.REOPENED:
            element.statusTooltip = 'open, click to update status to \'complete\'';
            break;
          case QuestionnaireStatus.STARTED_REGISTER:
            const status = element.answers.length > 0 ? 'started' : 'register';
            element.statusTooltip = status;
            element.notClickable = true;
            break;
          case QuestionnaireStatus.COMPLETED:
            element.statusTooltip = 'completed, click to update status to \'open\'';
            break;
          case QuestionnaireStatus.TIMEOUT:
            element.statusTooltip = 'timedout, click to update status to \'open\'';
            break;
          default:
            element.statusTooltip = 'unknown';
            break;
        }
      });
    } else if (this.attempts.length === 1) {
      const attempt = this.attempts[0];
      switch (attempt.status) {
        case QuestionnaireStatus.OPEN:
        case QuestionnaireStatus.REOPENED:
          this.status = 'open';
          this.showStatusTooltip = true;
          this.statusTooltip = 'complete';
          break;
        case QuestionnaireStatus.STARTED_REGISTER:
          this.status = attempt.answers.length > 0 ? 'started' : 'register';
          break;
        case QuestionnaireStatus.COMPLETED:
          this.status = 'completed';
          this.showStatusTooltip = true;
          this.statusTooltip = 'open';
          break;
        case QuestionnaireStatus.TIMEOUT:
          this.status = 'timedout';
          this.showStatusTooltip = true;
          this.statusTooltip = 'open';
          break;
        default:
          this.status = 'unknown';
          this.statusTooltip = '';
          break;
      }

      if (this.statusTooltip) {
        this.tooltip = `Click to update status to '${this.statusTooltip}'`;
      } else {
        this.tooltip = '';
      }
    }
    if (this.attempts.length > 0) {
      const attempt = this.attempts[0];
      this.params.data.u_q_contact.forEach(contact => {
        if (contact.id_questionnaire === attempt.questionnaire_id
          && contact.user_id === attempt.user_id) {
          this.checked = contact.contact === '1' ? true : false;
        }
      });
    }
  }

  /**
   * Call refresh() method from ParticipantsComponent
   */
  private invokeParentMethod() {
    this.params.context.componentParent.refresh();
  }

  /**
   * Change questionnaire contact handler (0/1)
   */
  onCanContactClicked() {
    const contact = !this.checked ? '1' : '0';
    const data = [];
    const uqContact: UserQuestionnaireContact = {
      user_id: this.attempts[0].user_id,
      id_questionnaire: this.attempts[0].questionnaire_id,
      contact: contact
    };
    data.push(uqContact);
    this.userService.updateUsersQuestionnaireContact({data: data}).subscribe((res: any) => {
      this.invokeParentMethod();
    }, error => {
      // Handle error
    });
  }

  onDeleteAttempt() {
    if (this.attempts.length === 1) {
      this.deleteAttempt(this.attempts[0].id);
    } else {
      const dialogRef = this.openDeleteDialog();
      dialogRef.afterClosed().subscribe((data: any) => {
        if (data && data.attempt) {
          this.deleteAttempt(data.attempt);
        }
      });
    }
  }

  private deleteAttempt(id: number) {
    const dialogRef = this.openConfirmDeleteDialog();
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.userService.deleteAttemptById(id).subscribe((attempt: Attempt | void) => {
          this.invokeParentMethod();
        });
      }
    });
  }

  onUpdateStatusClicked(id: number, status: number) {
    let newStatus;
    switch (status) {
      case QuestionnaireStatus.OPEN:
      case QuestionnaireStatus.REOPENED:
        newStatus = QuestionnaireStatus.COMPLETED;
        break;
      case QuestionnaireStatus.COMPLETED:
        newStatus = QuestionnaireStatus.REOPENED;
        break;
      case QuestionnaireStatus.TIMEOUT:
        newStatus = QuestionnaireStatus.REOPENED;
        break;
      default:
        return;
    }
    const attempt = {} as Attempt;
    attempt.id = id;
    attempt.status = newStatus;
    if (newStatus === QuestionnaireStatus.REOPENED) {
      attempt.passed_time = 0;
      attempt.is_note_sent = 0;
    }
    this.dataService.updateAttempt(attempt).subscribe(() => {
      this.invokeParentMethod();
    });
  }

  private openConfirmDeleteDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '400px',
      data: {
        text: 'Are you sure you want to delete this attempt?'
      }
    });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      data: {
        title: title,
        text: text
      }
    });
  }

  private openDeleteDialog(): MatDialogRef<any> {
    return this.dialog.open(DeleteAttemptComponent, <any>{
      width: '550px',
      data: {
        attempts: this.attempts
      }
    });
  }

  /**
   * Required for implementation ICellRendererAngularComp interface
   */
  refresh(): boolean {
    return false;
  }

}
