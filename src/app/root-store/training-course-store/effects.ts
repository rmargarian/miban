import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, concatMap } from 'rxjs/operators';
import { DataService } from '@app/services/data.service';
import * as featureActions from './actions';

@Injectable()
export class TrainingCoursesEffects {
/**
 * Initiate store
 */
  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadRequestAction>(featureActions.ActionTypes.LOAD_REQUEST),
      startWith(new featureActions.LoadRequestAction()),
      concatMap(action =>
        this.dataService.getAllTrainingCourses()
          .pipe(
            map(items => new featureActions.LoadSuccessAction( items )),
            catchError(error => observableOf(new featureActions.LoadFailureAction({ error })))
          )
      )
    );

  constructor(private dataService: DataService, private actions$: Actions) { }
}
