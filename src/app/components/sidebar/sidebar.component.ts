import {Component, OnInit, OnDestroy} from '@angular/core';
import {AuthenticationService, DataService} from '@app/services';
import {Observable, Subject} from 'rxjs';
import {distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {Store, select} from '@ngrx/store';

import {
  RootStoreState,
  UserStoreSelectors,
  RouteStoreActions,
  RouteStoreSelectors,
  QuestionnaireStoreSelectors,
  QuestionnaireStoreActions
} from '../../root-store';

import {Questionnaire} from '@app/models';
import {RoutesEnum, QuestionnaireType, RolesEnum} from '@app/enums';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  keyId: string;
  route$: Observable<string>;
  qId$: Observable<number>;

  hasUnsavedQTemplate: boolean = false;
  private destroySubject$: Subject<void> = new Subject();

  routes = RoutesEnum;

  assessments: Questionnaire[] = [];
  profiles: Questionnaire[] = [];
  feedback: Questionnaire[] = [];

  constructor(private store$: Store<RootStoreState.State>,
              private authenticationService: AuthenticationService,
              private dataService: DataService) {

    this.route$ = this.store$.select(RouteStoreSelectors.selectChildRoute);
    this.qId$ = this.store$.select(QuestionnaireStoreSelectors.selectQuestionnaireSelectedId);
  }

  ngOnInit() {
    this.initStates();

    this.store$.pipe(
      distinctUntilChanged(),
      select(UserStoreSelectors.selectUserCompanyId)
    ).subscribe((id: number) => {
      this.keyId = id ? id.toString() : '';
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionnaireStoreSelectors.selectAll)
      ).subscribe((data: Questionnaire[]) => {
      this.profiles = [];
      this.assessments = [];
      this.feedback = [];
      data.forEach((questionnaire) => {
        switch (questionnaire.type) {
          case QuestionnaireType.ASSESSMENT:
            this.assessments.push(questionnaire);
            break;
          case QuestionnaireType.PROFILE:
            this.profiles.push(questionnaire);
            break;
          case QuestionnaireType.FEEDBACK:
            this.feedback.push(questionnaire);
            break;
        }
      });
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  private initStates() {
    this.store$.dispatch(new QuestionnaireStoreActions.LoadRequestAction());
  }

  navigate(route: string, param?: string) {
    param = param ? param : '';
    if (route === this.routes.CLIENTS) {
      (<any>window).open('clients/reports', '_blank');
    } else {
      this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: route, param: param}));
    }
  }

  logout() {
    this.authenticationService.logout();
  }
}
