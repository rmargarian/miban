import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { map, delay, takeUntil, distinctUntilChanged, take } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MatTabGroup } from '@angular/material';
import {
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors } from '@angular/forms';

import {
  RootStoreState,
  RouteStoreActions,
  RouteStoreSelectors,
  QuestionnaireStoreActions
} from '../../root-store';

import { InformationDialogComponent } from '@app/components';
import { QuestionnaireType, RoutesEnum, RolesEnum } from '@app/enums';
import { Questionnaire } from '@app/models';
import { QuestionnairesService } from '@app/services';

@Component({
  selector: 'app-questionnaire-add-page',
  templateUrl: './questionnaire-add-page.component.html',
  styleUrls: ['./questionnaire-add-page.component.scss']
})
export class QuestionnaireAddPageComponent implements OnInit, OnDestroy {
  @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;
  form: FormGroup;
  qType: number;
  qName: string;
  parentRoute: string;
  validating: boolean = false;
  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private store$: Store<RootStoreState.State>,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private questionnairesService: QuestionnairesService) { }

  ngOnInit() {
    this.store$.pipe(
      distinctUntilChanged(),
      take(1),
      takeUntil(this.destroySubject$),
      select(RouteStoreSelectors.selectChildRoute)
     ).subscribe((route: string) => {
       switch (route) {
         case RoutesEnum.PROFILES_ADD:
           this.qType = QuestionnaireType.PROFILE;
           this.qName = 'Profile';
           this.parentRoute = RoutesEnum.PROFILES;
           break;
         case RoutesEnum.ASSESSMENTS_ADD:
           this.qType = QuestionnaireType.ASSESSMENT;
           this.qName = 'Assessment';
           this.parentRoute = RoutesEnum.ASSESSMENTS;
           break;
         case RoutesEnum.FEEDBACK_ADD:
           this.qType = QuestionnaireType.FEEDBACK;
           this.qName = 'Feedback';
           this.parentRoute = RoutesEnum.FEEDBACK;
           break;
         default:
         this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: RoutesEnum.WELCOME, param: ''}));
         }
     });

     this.form = this.formBuilder.group({
      'title': ['', [Validators.required], focus()],
      'abbreviation': ['', [], this.validateAcronymNotTaken.bind(this)],
      'description': [''],
      'welcome': [''],
      'incomplete_timeout': ['0', [Validators.required, Validators.min(1)]]
    });
  }

   /**
   * Validates acronym is not taken.
   */
  private validateAcronymNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    if (!this.form) {
      return new Observable(null);
    }

    this.validating = true;
    return this.questionnairesService.isAcronymValid(control.value)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;
          const resp = (res || !control.value) ? null : {questionnaireAcronymTaken: true, value: control.value};
          return resp;
        }));
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  private refresh() {
    this.reset();
    this.store$.dispatch(new QuestionnaireStoreActions.LoadRequestAction());
  }

  private reset() {
    this.tabGroup.selectedIndex = 0;
    this.form.reset();
  }

  add() {
    this.reset();
  }

  numericKeyDown($event) {
    if (!(/[0-9]/).test($event.key) && $event.keyCode !== 8) {
      $event.preventDefault();
    }
  }

  save() {
    if (this.form.valid) {
      const quest = this.form.value;
      quest.type = this.qType;
      this.questionnairesService.createQuestionnaire(quest)
      .subscribe((q: Questionnaire) => {
        this.openInformationDialog(`${this.qName} saved`, 'Information');
        this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: this.parentRoute, param: q.id.toString()}));
        this.refresh();
      }, err => {
        this.openInformationDialog(err.error.message, 'Error');
      });
    }
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      width: '400px',
      data: {
        title: title,
        text: text
      }
    });
  }
}
