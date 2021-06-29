import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, concatMap, tap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { AttemptService } from '@app/_user/services/attempt.service';
import { DataService } from '@app/services/data.service';
import * as RootStoreState from '@app/root-store/state';
import * as RouteStoreActions from '../route-store/actions';
import * as AttemptStoreActions from '@app/root-store/attempt-store/actions';
import * as featureActions from './actions';
import { User, Keys, QuestionGroup, Questionnaire } from '@app/models';
import { RolesEnum } from '@app/enums';
import { UserRoutesEnum } from '@app/_user/enums';

@Injectable()
export class AttemptStoreEffects {
/**
 * Loads User's data for CHANGE_KEY route
 */
  @Effect()
  loadUserRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadUserRequestAction>(featureActions.ActionTypes.LOAD_USER_REQUEST),
      map((action: featureActions.LoadUserRequestAction) => action.payload),
      concatMap((payload) =>
        this.attemptService.getUserIncludesInCompany(payload.uId, payload.kId, payload.sKey)
          .pipe(
            map((item: User) => new featureActions.LoadUserSuccessAction(item)),
            catchError(error => observableOf(new featureActions.LoadUserFailureAction({ error })))
          )
      )
    );
/**
 * Loads User's data (including currency, attempts and answers) for 'start' and 'auth' routes
 */
  @Effect()
  loadUserAttemptsRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadUserAttemptsRequestAction>(featureActions.ActionTypes.LOAD_USER_ATTEMPTS_REQUEST),
      map((action: featureActions.LoadUserAttemptsRequestAction) => action.payload),
      concatMap((payload) =>
        this.attemptService.getUserAttempts(payload.uId, payload.kId, payload.qId)
          .pipe(
            map((item: User) => new featureActions.LoadUserSuccessAction(item)),
            catchError(error => observableOf(new featureActions.LoadUserFailureAction({ error })))
          )
      )
    );

  @Effect()
  loadKeyRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadKeyRequestAction>(featureActions.ActionTypes.LOAD_KEY_REQUEST),
      map((action: featureActions.LoadKeyRequestAction) => action.payload),
      concatMap((payload) =>
        this.dataService.getCompanyById(payload)
          .pipe(
            map((item: Keys) => new featureActions.LoadKeySuccessAction(item)),
            catchError(error => observableOf(new featureActions.LoadKeyFailureAction({ error })))
          )
      )
    );

  @Effect()
  enterKeyNavigateRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.NavigateAction>(featureActions.ActionTypes.NAVIGATE),
      withLatestFrom(this.store$),
      map(([action, storeState]: [featureActions.NavigateAction, RootStoreState.State]) =>
        ({ action: action.payload, state: storeState })),
      tap((payload) => {
        this.store$.dispatch(new RouteStoreActions.Navigate({
          role: RolesEnum.USER,
          path: payload.state.route.childRoute + '/' + payload.action.path,
          param: '',
          queryParams: payload.action.queryParams
        }));
      }),
      map(() => new featureActions.NavigateSuccessAction())
    );

  @Effect()
  loadGroupRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadGroupsRequestAction>(featureActions.ActionTypes.LOAD_GROUPS_REQUEST),
      withLatestFrom(this.store$),
      map(([action, storeState]: [featureActions.LoadGroupsRequestAction, RootStoreState.State]) =>
        ({ id: action.payload, state: storeState })),
      concatMap((payload) =>
        this.attemptService.getGroupsByQuestionnaireId(payload.id)
          .pipe(
            map(items => new featureActions.LoadGroupsSuccessAction(this.sortGroups(items, payload.state))),
            catchError(error => observableOf(new featureActions.LoadGroupsFailureAction({ error })))
          )
      )
    );

  /**
   * Returns ACTIVE groups sorted by 'order_pos', including groups' ACTIVE questions sorted by 'question_order'
   * And checks if there are at least one active group and one active question in it
   * @param groups (Question groups retreived from server)
   * @param state (RootStoreState.State)
   * @returns array with active QuestionGroup (each one includes array with active Questions)
   */
  private sortGroups(questionnaire: Questionnaire, state: RootStoreState.State): QuestionGroup[] {
    
    let groups = questionnaire.q_groups;
    /**Sort groups */
    groups.sort((a, b) => {
      return a.order_pos - b.order_pos;
    });

    let noActive = true;
    /**Leave only active groups and with at least one active question in group */
    groups = groups.filter((group: QuestionGroup) =>
      (group.is_active === 1 && group.group_questions_map.length > 0));
    /**Sort questions */
    groups.forEach(group => {
      group.group_questions_map.sort((a, b) => {
        return a.question_order - b.question_order;
      });
      if (group.group_questions_map.length) {
        noActive = false;
      }
    });

    /**Go to 'enter-key' route if questionnaire doesn't contain active groups and questions */
    if (noActive) {
      this.store$.dispatch(new AttemptStoreActions.SetErrorAction(
        `[ERROR] The '${questionnaire.title}' questionnaire doesn't have active question groups or doesn't have questions`));
      this.store$.dispatch(new AttemptStoreActions.NavigateAction({ path: UserRoutesEnum.ENTER_KEY }));
    }
    return groups;
  }

  constructor(
    private actions$: Actions,
    private store$: Store<RootStoreState.State>,
    private attemptService: AttemptService,
    private dataService: DataService) { }
}
