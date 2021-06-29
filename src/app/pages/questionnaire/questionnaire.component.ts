import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

import {
  RootStoreState,
  RouteStoreActions,
  RouteStoreSelectors
} from '../../root-store';

import { RolesEnum, RoutesEnum } from '@app/enums';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnairePageComponent implements OnInit, OnDestroy {
  qName: string = '';
  addPath: string = '';
  private destroySubject$: Subject<void> = new Subject();
  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(RouteStoreSelectors.selectChildRoute)
    ).subscribe((route: string) => {
      switch (route) {
        case RoutesEnum.PROFILES:
          this.qName = 'Profiles';
          this.addPath = RoutesEnum.PROFILES_ADD;
          break;
        case RoutesEnum.ASSESSMENTS:
          this.qName = 'Assessment';
          this.addPath = RoutesEnum.ASSESSMENTS_ADD;
          break;
        case RoutesEnum.FEEDBACK:
          this.qName = 'Feedback';
          this.addPath = RoutesEnum.FEEDBACK_ADD;
          break;
        default:
          this.qName = '';
        }
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  addQuestionnaire() {
    this.store$.dispatch(new RouteStoreActions.Navigate(
      {role: RolesEnum.ADMIN, path: this.addPath, param: ''}));
  }

}
