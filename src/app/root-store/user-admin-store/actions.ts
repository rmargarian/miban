import { Action } from '@ngrx/store';
import { Admin } from '@app/models';
import { SortColumn } from '@app/interfaces';

export enum ActionTypes {
  SET_SELECTED_ADMIN = '[Admin] Set selected Admin',
  SET_SORT_COLUMN = '[Admin] Set sort column',
  SET_FILTER_VALUE = '[Admin] Set filter value'
}

export class SetSelectedAdminAction implements Action {
  readonly type = ActionTypes.SET_SELECTED_ADMIN;
  constructor(public payload: Admin) {}
}

export class SetSortColumnAction implements Action {
  readonly type = ActionTypes.SET_SORT_COLUMN;
  constructor(public payload: SortColumn) {}
}

export class SetFilterValueAction implements Action {
  readonly type = ActionTypes.SET_FILTER_VALUE;
  constructor(public payload: string) {}
}

export type Actions =
  SetSelectedAdminAction |
  SetFilterValueAction |
  SetSortColumnAction;
