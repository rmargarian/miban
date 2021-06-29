import { Component, OnInit } from '@angular/core';
import { Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { DialogComponent } from '@app/components';
import { ModalType } from '@app/enums';

declare function setCloneSuffix(field, count, postfix): any;

@Component({
  selector: 'app-training-course-modal',
  templateUrl: './training-course-modal.component.html',
  styleUrls: ['./training-course-modal.component.scss']
})
export class TrainingCourseModalComponent extends DialogComponent implements OnInit {
  header: string = '';
  validating: boolean = false;
  showValidation: boolean = false;

  ngOnInit() {
    if (this.data) {
      this.header = this.data.header;

      if (this.data.type === ModalType.CLONE) {
        this.trainingCourseService.getFieldUniqueCloneCount('name', this.data.trainingCourse.name).subscribe((count: number) => {
          this.getControl('course_name').setValue(setCloneSuffix(this.data.trainingCourse.name, count, ' - Clone'));
        });
      }
    }
    this.form = this.formBuilder.group({
      'course_name': [this.data.trainingCourse ? this.data.trainingCourse.name : '', [Validators.required],
        this.validateNameNotTaken.bind(this)]
    });

  }

  save() {
    this.showValidation = true;
    if (this.form.invalid || this.validating) { return; }
    
    this.closeDialog(this.form.value);
  }

  private validateNameNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    this.validating = true;
    return this.validationService.isTrainingCourseNameValid(control.value)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;
          const sameKeyName = (this.data.trainingCourse && this.data.trainingCourse.name === control.value
            && this.data.type !== ModalType.CLONE);
          let resp;
          if (this.data.trainingCourse && this.data.trainingCourse.name) {
            resp = (sameKeyName || res) ? null : {trainingCourseNameTaken: true};
          } else {
            resp = (res) ? null : {trainingCourseNameTaken: true};
          }
          return resp;
        }));
  }
}
