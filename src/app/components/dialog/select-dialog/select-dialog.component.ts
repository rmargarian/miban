import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../dialog.component';
import { FormControl } from '@angular/forms';
import { QuestionnairesByType } from '@app/interfaces';

@Component({
  selector: 'app-select-dialog',
  templateUrl: './select-dialog.component.html',
  styleUrls: ['./select-dialog.component.scss']
})
export class SelectDialogComponent extends DialogComponent implements OnInit {

  header: string = '';
  info: any[];
  questionnaires: QuestionnairesByType;

  radio: FormControl;

  ngOnInit() {
    if (this.data) {
      this.header = this.data.header;
      this.questionnaires = this.questionnairesService.splitQuestionnairesByType(this.data.info);
    }

    const defaultValue = this.getDefaultValue();

    this.form = this.formBuilder.group({
      compliance_option: [defaultValue],
    });
  }

  /**
   * In Export detailed responses popup Select Profile/Assessment/Feedback by default 
   * if there's only one valid choice
   */
  private getDefaultValue(): number {
    if (!this.questionnaires) { return null; }

    let enabledCount = 0;
    let qId;
    for (const key in this.questionnaires) {
      if (this.questionnaires.hasOwnProperty(key)) {
        const questionnaires = this.questionnaires[key];
        questionnaires.forEach(q => {
          if (q.enabled) {
            enabledCount++;
            qId = q.id;
          }
        });
        if (enabledCount > 1) { break; }
      }
    }

    return enabledCount === 1 ? qId : null;
  }

  export() {
    this.closeDialog(this.form.controls.compliance_option.value);
  }

}
