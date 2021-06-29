import { Action } from '@ngrx/store';
import { User, Keys, QuestionGroup } from '@app/models';

export enum ActionTypes {
  LOAD_USER_REQUEST = '[Attempt] Load User Request',
  LOAD_USER_FAILURE = '[Attempt] Load User Failure',
  LOAD_USER_SUCCESS = '[Attempt] Load User Success',
  LOAD_USER_ATTEMPTS_REQUEST = '[Attempt] Load User Attempts Request',

  LOAD_KEY_REQUEST = '[Attempt] Load Key Request',
  LOAD_KEY_FAILURE = '[Attempt] Load Key Failure',
  LOAD_KEY_SUCCESS = '[Attempt] Load Key Success',
  SET_ERROR = '[Attempt] Set Error',
  SET_USER_ID = '[Attempt] Set User id',
  SET_QUESTIONNAIRE_ID = '[Attempt] Set Questionnaire id',
  SET_NOT_REGISTRED = '[Attempt] Set not registred',
  NAVIGATE = '[Attempt] navigate',
  NAVIGATE_SUCCESS = '[Attempt] navigate success',
  SET_SECRET_KEY = '[Attempt] Set Secret key',
  SET_ENTERED_EMAIL = '[Attempt] Set Entered email',
  SET_IS_ADMIN = '[Attempt] Set isAdmin',
  SET_UNSUB_EMAIL = '[Attempt] Set Unsubscribe email',

  SET_RES_REPORT_CODE = '[Attempt] Set Res Report Code',

  LOAD_GROUPS_REQUEST = '[Attempt] Load Groups Request',
  LOAD_GROUPS_FAILURE = '[Attempt] Load Groups Failure',
  LOAD_GROUPS_SUCCESS = '[Attempt] Load Groups Success',
}

export class LoadUserRequestAction implements Action {
  readonly type = ActionTypes.LOAD_USER_REQUEST;
  constructor(public payload: {uId: number, kId: number, sKey?: string}) {}
}

export class LoadUserFailureAction implements Action {
  readonly type = ActionTypes.LOAD_USER_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadUserSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_USER_SUCCESS;
  constructor(public payload: User) {}
}

export class LoadUserAttemptsRequestAction implements Action {
  readonly type = ActionTypes.LOAD_USER_ATTEMPTS_REQUEST;
  constructor(public payload: {uId: number, kId: number, qId: number}) {}
}


export class LoadKeyRequestAction implements Action {
  readonly type = ActionTypes.LOAD_KEY_REQUEST;
  constructor(public payload: number) {}
}

export class LoadKeyFailureAction implements Action {
  readonly type = ActionTypes.LOAD_KEY_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadKeySuccessAction implements Action {
  readonly type = ActionTypes.LOAD_KEY_SUCCESS;
  constructor(public payload: Keys) {}
}

export class SetErrorAction implements Action {
  readonly type = ActionTypes.SET_ERROR;
  constructor(public payload: string) {}
}

export class SetQuestionnaireIdAction implements Action {
  readonly type = ActionTypes.SET_QUESTIONNAIRE_ID;
  constructor(public payload: number) {}
}

export class SetUserIdAction implements Action {
  readonly type = ActionTypes.SET_USER_ID;
  constructor(public payload: number) {}
}

export class SetNotRegistredAction implements Action {
  readonly type = ActionTypes.SET_NOT_REGISTRED;
  constructor(public payload: boolean) {}
}

export class NavigateAction implements Action {
  readonly type = ActionTypes.NAVIGATE;
  constructor(public payload: {
    path: string,
    queryParams?: {kId: number, qId?: number, uId?: number}}) { }
}

export class NavigateSuccessAction implements Action {
  readonly type = ActionTypes.NAVIGATE_SUCCESS;
}

export class SetSecretKeyAction implements Action {
  readonly type = ActionTypes.SET_SECRET_KEY;
  constructor(public payload: string) {}
}

export class SetEnteredEmailAction implements Action {
  readonly type = ActionTypes.SET_ENTERED_EMAIL;
  constructor(public payload: string) {}
}

export class SetIsAdminAction implements Action {
  readonly type = ActionTypes.SET_IS_ADMIN;
  constructor(public payload: boolean) {}
}

export class SetUnsubEmailAction implements Action {
  readonly type = ActionTypes.SET_UNSUB_EMAIL;
  constructor(public payload: string) {}
}

export class SetResReportCodeAction implements Action {
  readonly type = ActionTypes.SET_RES_REPORT_CODE;
  constructor(public payload: string) {}
}

export class LoadGroupsRequestAction implements Action {
  readonly type = ActionTypes.LOAD_GROUPS_REQUEST;
  constructor(public payload: number) {}
}

export class LoadGroupsFailureAction implements Action {
  readonly type = ActionTypes.LOAD_GROUPS_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadGroupsSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_GROUPS_SUCCESS;
  constructor(public payload: QuestionGroup[] ) {}
}

export type Actions =
  LoadUserRequestAction |
  LoadUserAttemptsRequestAction |
  LoadUserFailureAction |
  LoadUserSuccessAction |
  LoadKeyRequestAction |
  LoadKeyFailureAction |
  LoadKeySuccessAction |
  SetErrorAction |
  SetQuestionnaireIdAction |
  SetUserIdAction |
  SetNotRegistredAction |
  NavigateAction |
  NavigateSuccessAction |
  SetSecretKeyAction |
  SetEnteredEmailAction |
  SetIsAdminAction |
  SetUnsubEmailAction|

  SetResReportCodeAction |

  LoadGroupsRequestAction |
  LoadGroupsFailureAction |
  LoadGroupsSuccessAction;
