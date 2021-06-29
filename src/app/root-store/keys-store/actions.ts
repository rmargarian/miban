import { Action } from '@ngrx/store';
import { Keys } from '@app/models';
import { SortColumn } from '@app/interfaces';

export enum ActionTypes {
  TRIGGER_SHOW_ALL = '[Key] Trigger Show All',
  SET_SHOW_ALL = '[Key] Set Show All',
  SET_SELECTED_KEY = '[Key] Set Selected Key',
  SET_SORT_COLUMN = '[Key] Set Sort Column',
  SET_FILTER_VALUE = '[Key] Set Filter Value',
  LOAD_REQUEST = '[Key] Load Request',
  LOAD_FAILURE = '[Key] Load Failure',
  LOAD_SUCCESS = '[Key] Load Success',
  LOAD_SHARED_REQUEST = '[Key] Load Shared Request',
  LOAD_SHARED_FAILURE = '[Key] Load Shared Failure',
  LOAD_SHARED_SUCCESS = '[Key] Load Shared Success'
}

export class LoadRequestAction implements Action {
  readonly type = ActionTypes.LOAD_REQUEST;
  constructor(public daysLimit?: number) {}
}

export class LoadFailureAction implements Action {
  readonly type = ActionTypes.LOAD_FAILURE;
  constructor(public payload: {error: string}) {}
}

export class LoadSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SUCCESS;
  constructor(public payload: Keys[]) {}
}

export class TriggerShowAllAction implements Action {
  readonly type = ActionTypes.TRIGGER_SHOW_ALL;
}

export class SetShowAllAction implements Action {
  readonly type = ActionTypes.SET_SHOW_ALL;
  constructor(public payload: boolean) {}
}

export class SetSelectedKeyAction implements Action {
  readonly type = ActionTypes.SET_SELECTED_KEY;
  constructor(public payload: Keys) {}
}

export class SetSortColumnAction implements Action {
  readonly type = ActionTypes.SET_SORT_COLUMN;
  constructor(public payload: SortColumn) {}
}

export class SetFilterValueAction implements Action {
  readonly type = ActionTypes.SET_FILTER_VALUE;
  constructor(public payload: string) {}
}

export class LoadSharedRequestAction implements Action {
  readonly type = ActionTypes.LOAD_SHARED_REQUEST;
}

export class LoadSharedFailureAction implements Action {
  readonly type = ActionTypes.LOAD_SHARED_FAILURE;
  constructor(public payload: {error: string}) {}
}

export class LoadSharedSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SHARED_SUCCESS;
  constructor(public payload: {shortList: Keys[], fullList: Keys[]}) {}
}

export type Actions =
  SetSelectedKeyAction |
  TriggerShowAllAction |
  SetShowAllAction |
  SetFilterValueAction |
  SetSortColumnAction  |
  LoadRequestAction    |
  LoadSuccessAction    |
  LoadFailureAction    |
  LoadSharedRequestAction |
  LoadSharedFailureAction |
  LoadSharedSuccessAction;
