import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, concatMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { KeysService } from '@app/services';
import { Keys } from '@app/models';
import * as RootStoreState from '@app/root-store/state';
import * as featureActions from './actions';

@Injectable()
export class KeysStoreEffects {
  /**
   * Initiate store
   */
  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadRequestAction>(featureActions.ActionTypes.LOAD_REQUEST),
      concatMap(action =>
        this.keysService.getAllKeys(action.daysLimit)
          .pipe(
            map(keysData => new featureActions.LoadSuccessAction(keysData)),
            catchError(error => observableOf(new featureActions.LoadFailureAction({ error })))
          )
      )
    );

  /**
* Get Questionnaires by company id,
* Get Users by company id,
* Get users Attempts Limits
* @param comany_id (selected company id)
*/
  @Effect()
  loadSharedRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadSharedRequestAction>(featureActions.ActionTypes.LOAD_SHARED_REQUEST),
      concatMap(() =>
        this.keysService.getAllKeys(null)
          .pipe(map((data: Keys[]) => {
            return data;
          }))
      ),
      concatMap((fullList) =>
        this.keysService.getAllKeys(270)
        .pipe(map((data: Keys[]) => {
          return {shortList: data, fullList: fullList};
        }))
      ),
      map((shared: {shortList: Keys[], fullList: Keys[]}) => new featureActions.LoadSharedSuccessAction(shared)),
      catchError(error => observableOf(new featureActions.LoadSharedFailureAction({ error }))
      )
    );

  constructor(private actions$: Actions,
    private store$: Store<RootStoreState.State>,
    private keysService: KeysService) {
  }
}
