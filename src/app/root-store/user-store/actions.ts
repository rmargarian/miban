import { Action } from '@ngrx/store';
import { User, Questionnaire } from '@app/models';
import { SortColumn } from '@app/interfaces';

export enum ActionTypes {
  LOAD_REQUEST = '[User] Load Request',
  LOAD_FAILURE = '[User] Load Failure',
  LOAD_SUCCESS = '[User] Load Success',
  RESET = '[User] Reset',
  SET_SHOW_ALL = '[User] Set Show All',
  TRIGGER_SHOW_ALL = '[User] Trigger Show All',
  SET_COMPANY_ID = '[User] Set Company id',
  SET_QUESTIONNAIRES = '[User] Set Questionnaires',
  SET_SELECTED_IDS = '[User] Set Selected Ids',
  TRIGGER_LOADING = '[User] Trigger loading',
  SET_FILTER_VALUE = '[User] Set filter value',
  SET_SORT_COLUMN_USER = '[User] Set Sort Column',
}

export class LoadRequestAction implements Action {
  readonly type = ActionTypes.LOAD_REQUEST;
  constructor(public payload: number) {}
}

export class LoadFailureAction implements Action {
  readonly type = ActionTypes.LOAD_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SUCCESS;
  constructor(public payload: User[]) {}
}

export class ResetAction implements Action {
  readonly type = ActionTypes.RESET;
}

export class SetShowAllAction implements Action {
  readonly type = ActionTypes.SET_SHOW_ALL;
  constructor(public payload: boolean) {}
}

export class TriggerShowAllAction implements Action {
  readonly type = ActionTypes.TRIGGER_SHOW_ALL;
}

export class SetCompanyIdAction implements Action {
  readonly type = ActionTypes.SET_COMPANY_ID;
  constructor(public payload: number) {}
}

export class SetQuestionnairesAction implements Action {
  readonly type = ActionTypes.SET_QUESTIONNAIRES;
  constructor(public payload: Questionnaire[]) {}
}

export class SetSelectedIdsAction implements Action {
  readonly type = ActionTypes.SET_SELECTED_IDS;
  constructor(public payload: number[]) {}
}

export class LoadingAction implements Action {
  readonly type = ActionTypes.TRIGGER_LOADING;
  constructor(public payload: boolean) {}
}

export class SetFilterValueAction implements Action {
  readonly type = ActionTypes.SET_FILTER_VALUE;
  constructor(public payload: string) {}
}

export class SetSortColumnAction implements Action {
  readonly type = ActionTypes.SET_SORT_COLUMN_USER;
  constructor(public payload: SortColumn) {}
}

export type Actions =
  LoadRequestAction |
  LoadFailureAction |
  LoadSuccessAction |
  ResetAction |
  SetShowAllAction |
  TriggerShowAllAction |
  SetCompanyIdAction |
  SetQuestionnairesAction |
  SetSelectedIdsAction |
  LoadingAction |
  SetFilterValueAction |
  SetSortColumnAction;
