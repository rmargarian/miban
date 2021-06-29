import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, concatMap } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';


import * as RootStoreState from '@app/root-store/state';
import * as UserStoreActions from './actions';

import { User } from '@app/models';
import { UserService } from '@app/services/user.service';
import { QuestionnairesService } from '@app/services/questionnaires.service';
import * as featureActions from './actions';

@Injectable()
export class UserStoreEffects {
  /**
   * Get Questionnaires by company id,
   * Get Users by company id,
   * Get users Attempts Limits
   * @param comany_id (selected company id)
   */
  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadRequestAction>(featureActions.ActionTypes.LOAD_REQUEST),
      map((action: featureActions.LoadRequestAction) => action.payload),
      concatMap((payload) =>
        this.questionnairesService.getQuestsByCompany(payload)
          .pipe(map((data) => {
            this.store$.dispatch(new UserStoreActions.SetQuestionnairesAction(data));
            return payload;
          }))
      ),
      concatMap((payload) =>
        this.userService.getAllUsersByCompany(payload)
          .pipe(map((data) => data))
      ),
      map((users: User[]) => new featureActions.LoadSuccessAction(users)),
      catchError(error => observableOf(new featureActions.LoadFailureAction({ error }))
      )
    );

  constructor(
    private userService: UserService,
    private questionnairesService: QuestionnairesService,
    private actions$: Actions,
    private store$: Store<RootStoreState.State>) { }
}
