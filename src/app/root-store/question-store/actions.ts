import { Action } from '@ngrx/store';
import { Question } from '@app/models';

export enum ActionTypes {
  LOAD_REQUEST = '[Question] Load Request',
  LOAD_FAILURE = '[Question] Load Failure',
  LOAD_SUCCESS = '[Question] Load Success',
  SET_FILTER_VALUE = '[Question] Set Filter Value',
  SET_SELECTED_QUESTION = '[Question] Set selected question'
}

export class LoadRequestAction implements Action {
  readonly type = ActionTypes.LOAD_REQUEST;
  constructor(public scrollToIndex: number) {}
}

export class LoadFailureAction implements Action {
  readonly type = ActionTypes.LOAD_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SUCCESS;
  constructor(public payload: Question[] ) {}
}

export class SetFilterValueAction implements Action {
  readonly type = ActionTypes.SET_FILTER_VALUE;
  constructor(public payload: string ) {}
}

export class SetSelectedQuestionAction implements Action {
  readonly type = ActionTypes.SET_SELECTED_QUESTION;
  constructor(public payload: Question) {}
}

export type Actions =
  LoadRequestAction |
  LoadFailureAction |
  LoadSuccessAction |
  SetFilterValueAction |
  SetSelectedQuestionAction;
