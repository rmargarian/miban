import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { ValidationService } from '@app/services/validation.service';
import { QuestionnairesService } from '@app/services/questionnaires.service';
import { KeysService } from '@app/services/keys.service';
import { TrainingCourseService } from '@app/services/training.course.service';
import { DataService } from '@app/services/data.service';
import { QuestionService } from '@app/services/question.service';
import { Store } from '@ngrx/store';
import { RootStoreState } from '@app/root-store';
import { ReportsService} from '@app/_reports/services/reports.service';
import { AuthenticationService} from '@app/services/authentication.service';
import { AdminService} from '@app/services/admin.service';
import { FreeAttemptSessionStorageService } from '@app/_user/services/free-attempt-session-storage.service';

enum KeyCodesEnum {
  ESCAPE = 27,
  CTRL = 17
}

@Component({
  selector: 'app-dialog',
  template: '',
  styleUrls: ['./dialog.component.scss']
})
/**
 * Base component for all dialogs
 */
export class DialogComponent {

  form: FormGroup;
  keyCodes = KeyCodesEnum;
  showValidation: boolean = false;

  constructor(public dialogRef?: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data?: any,
              protected changeDetectorRef?: ChangeDetectorRef,
              protected formBuilder?: FormBuilder,
              protected validationService?: ValidationService,
              protected questionnairesService?: QuestionnairesService,
              protected keyService?: KeysService,
              protected questionService?: QuestionService,
              protected authenticationService?: AuthenticationService,
              protected adminService?: AdminService,
              protected reportService?: ReportsService,
              public store$?: Store<RootStoreState.State>,
              protected trainingCourseService?: TrainingCourseService,
              protected dialog?: MatDialog,
              protected dataService?: DataService,
              protected freeAttemptSessionStorageService?: FreeAttemptSessionStorageService
              ) { }

  get f() {
    return this.form.controls;
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  closeDialog(result?: any): void {
    this.dialogRef.close(result);
  }
}
