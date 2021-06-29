import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, concatMap } from 'rxjs/operators';

import { IncompleteAttempt } from '@app/models';
import { QuestionnairesService } from '@app/services/questionnaires.service';
import * as featureActions from './actions';

@Injectable()
export class IncompleteAttemptStoreEffects {
  /**
   * Get IncompleteAttempts by questionnaire id
   * @param questionnaire_id (number)
   */
  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadRequestAction>(featureActions.ActionTypes.LOAD_REQUEST),
      map((action: featureActions.LoadRequestAction) => action.payload),
      concatMap((payload) =>
        this.questionnairesService.getAllIncompleteAttemptsByQId(payload)
          .pipe(
            map((attempts: IncompleteAttempt[]) => new featureActions.LoadSuccessAction(attempts)),
            catchError(error => observableOf(new featureActions.LoadFailureAction({ error })))
          )
      )
    );

  constructor(
    private questionnairesService: QuestionnairesService,
    private actions$: Actions) { }
}
