import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, concatMap} from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { QuestionService } from '@app/services/question.service';
import * as RootStoreState from '@app/root-store/state';
import * as featureActions from './actions';

@Injectable()
export class QuestionStoreEffects {
  /**
   * Initiate store
   */
  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadRequestAction>(featureActions.ActionTypes.LOAD_REQUEST),
      concatMap(action =>
        this.questionService.getAll(null, true)
          .pipe(
            map(questionsData => new featureActions.LoadSuccessAction(questionsData)),
            catchError(error => observableOf(new featureActions.LoadFailureAction({ error })))
          )
      )
    );

  constructor(
    private actions$: Actions,
    private store$: Store<RootStoreState.State>,
    private questionService: QuestionService) { }
}
