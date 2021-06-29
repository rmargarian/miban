import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, delay, takeUntil } from 'rxjs/operators';
import { Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import {
  AbstractControl,
  ValidationErrors } from '@angular/forms';

import { DialogComponent, ConfirmationDialogComponent } from '@app/components';

@Component({
  selector: 'app-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss']
})
export class AddTemplateComponent extends DialogComponent implements OnInit, OnDestroy {

  validating = true;
  private destroySubject$: Subject<void> = new Subject();

  ngOnInit() {
    this.dialogRef.backdropClick().subscribe(_ => {
      this.onClose();
    });
    this.dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.keyCode === this.keyCodes.ESCAPE) {
        event.preventDefault();
        this.onClose();
      }
    });

    this.form = this.formBuilder.group({
      'email_desc': [this.data.item.email_desc || '', [this.validateNotEmpty.bind(this)], this.validateTemplate.bind(this)],
      'email_subject': [this.data.item.email_subject || '', [this.validateNotEmpty.bind(this)]],
      'tpl_content': [this.data.item.tpl_content || '', [this.validateNotEmpty.bind(this)]]
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  /**
   * Separate validator to check if all fields not empty
   * [Validators.required] Not used because of problems with tooltips in Firefox
   */
  validateNotEmpty(control: AbstractControl): ValidationErrors {
    if (control.value === '') {
      return {empty: true};
    } else {
      return null;
    }
  }

  validateTemplate(control: AbstractControl): Observable<ValidationErrors> {
    this.validating = true;
    const params = this.data.item.quest_id + ',' +
                   this.data.item.email_type + ',' +
                   control.value;
    return this.validationService.isQuestionnaireTemplateValid(params)
    .pipe(
      delay(500),
      map(res => {
        this.validating = false;

        const sameDescr = (this.data.edit && this.data.item.email_desc === control.value) ? true : false;
        let resp;
        if (this.data.item.email_desc) {
          resp = (sameDescr || res) ? null : { templateTaken: true };
        } else {
          resp = (res) ? null : { templateTaken: true };
        }
        return resp;
    }));
  }

  save() {
    const template = this.form.value;
    this.closeDialog(template);
  }

  onClose() {
    if (!this.form.pristine) {
      const dialogRef = this.openConfirmationDialog();
      dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        if (data) {
          this.closeDialog(null);
        }
      });
    } else {
      this.closeDialog(null);
    }
  }

  private openConfirmationDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '530px',
      data: {
        title: 'Confirmation Close',
        text: 'You have some unsaved changes. Are you sure you want to close the editor?'
      }
    });
  }

}
