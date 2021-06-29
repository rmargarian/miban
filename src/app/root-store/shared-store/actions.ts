import { Action } from '@ngrx/store';
import { SharedModel } from '@app/models';

export enum ActionTypes {
  LOAD_REQUEST = '[Shared] Load Request',
  LOAD_FAILURE = '[Shared] Load Failure',
  LOAD_SUCCESS = '[Shared] Load Success'
}

export class LoadRequestAction implements Action {
  readonly type = ActionTypes.LOAD_REQUEST;
}

export class LoadFailureAction implements Action {
  readonly type = ActionTypes.LOAD_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SUCCESS;
  constructor(public payload: SharedModel ) {}
}

export type Actions = LoadRequestAction | LoadFailureAction | LoadSuccessAction;
