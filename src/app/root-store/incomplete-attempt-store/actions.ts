import { Action } from '@ngrx/store';
import { IncompleteAttempt } from '@app/models';

export enum ActionTypes {
  LOAD_REQUEST = '[IncompleteAttempt] Load Request',
  LOAD_FAILURE = '[IncompleteAttempt] Load Failure',
  LOAD_SUCCESS = '[IncompleteAttempt] Load Success',
  RESET = '[IncompleteAttempt] Reset',
  SET_QUESTIONNAIRE_ID = '[IncompleteAttempt] Set Questionnaire id',
  SET_SELECTED_IDS = '[IncompleteAttempt] Set Selected Ids',
  TRIGGER_LOADING = '[IncompleteAttempt] Trigger loading'
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
  constructor(public payload: IncompleteAttempt[]) {}
}

export class ResetAction implements Action {
  readonly type = ActionTypes.RESET;
}

export class SetQuestionnaireIdAction implements Action {
  readonly type = ActionTypes.SET_QUESTIONNAIRE_ID;
  constructor(public payload: number) {}
}

export class SetSelectedIdsAction implements Action {
  readonly type = ActionTypes.SET_SELECTED_IDS;
  constructor(public payload: number[]) {}
}

export class LoadingAction implements Action {
  readonly type = ActionTypes.TRIGGER_LOADING;
  constructor(public payload: boolean) {}
}

export type Actions =
  LoadRequestAction |
  LoadFailureAction |
  LoadSuccessAction |
  ResetAction |
  SetQuestionnaireIdAction |
  SetSelectedIdsAction |
  LoadingAction;
