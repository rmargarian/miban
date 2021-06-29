import { Action } from '@ngrx/store';
import { User } from '@app/models';

export enum ActionTypes {
  SET_COMPANY_ID = '[Import] Set Company id',
  SET_USERS = '[Import] Set users',
  SET_FILE = '[Import] Set file',
  SET_SHOW_SECOND = '[Import] Set show second',
  SET_SHOW_THIRD = '[Import] Set show third',
  RESET = '[Import] Reset'
}
/**Stores selected key id */
export class SetCompanyIdAction implements Action {
  readonly type = ActionTypes.SET_COMPANY_ID;
  constructor(public payload: number) {}
}
/**Stores users array retrieved from file */
export class SetUsersAction implements Action {
  readonly type = ActionTypes.SET_USERS;
  constructor(public payload: User[]) {}
}
/**Stores selected file */
export class SetFileAction implements Action {
  readonly type = ActionTypes.SET_FILE;
  constructor(public payload: File) {}
}
/**Stores 'Show STEP 2' flag */
export class SetShowSecondAction implements Action {
  readonly type = ActionTypes.SET_SHOW_SECOND;
  constructor(public payload: boolean) {}
}
/**Stores 'Show STEP 3' flag */
export class SetShowThirdAction implements Action {
  readonly type = ActionTypes.SET_SHOW_THIRD;
  constructor(public payload: boolean) {}
}

/**Resets all states */
export class ResetAction implements Action {
  readonly type = ActionTypes.RESET;
}

export type Actions =
  SetCompanyIdAction |
  SetUsersAction |
  SetFileAction |
  SetShowSecondAction |
  SetShowThirdAction |
  ResetAction;
