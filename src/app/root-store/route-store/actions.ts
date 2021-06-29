import { Action } from '@ngrx/store';
import { User, Questionnaire } from '@app/models';

export enum ActionTypes {
  SET_MAIN_ROUTE = '[Route] Set Main Route',
  SET_CHILD_ROUTE = '[Route] Set Child Route',
  NAVIGATE = '[Route] Navigate',
  NAVIGATE_SUCCESS = '[Route] Navigate Success'
}

export class SetMainRoute implements Action {
  readonly type = ActionTypes.SET_MAIN_ROUTE;
  constructor(public payload: string) {}
}

export class SetChildRoute implements Action {
  readonly type = ActionTypes.SET_CHILD_ROUTE;
  constructor(public payload: string) {}
}

export class Navigate implements Action {
  readonly type = ActionTypes.NAVIGATE;
  constructor(public payload: { role: string, path: string, param: string, queryParams?: any }) {}
}

export class NavigateSuccessAction implements Action {
  readonly type = ActionTypes.NAVIGATE_SUCCESS;
}

export type Actions = SetMainRoute | SetChildRoute | Navigate | NavigateSuccessAction;
