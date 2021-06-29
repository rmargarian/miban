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
export class ImportStoreEffects {


  constructor(
    private userService: UserService,
    private questionnairesService: QuestionnairesService,
    private actions$: Actions,
    private store$: Store<RootStoreState.State>) { }
}
