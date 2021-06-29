import { Action } from '@ngrx/store';
import { Questionnaire, QuestionGroup, Question, User, SendEmailTemplate } from '@app/models';
import { SelectStatusesEnum, SortStatusesEnum } from '@app/enums';

export enum ActionTypes {
  LOAD_REQUEST = '[Questionnaire] Load Request',
  LOAD_FAILURE = '[Questionnaire] Load Failure',
  LOAD_SUCCESS = '[Questionnaire] Load Success',
  SET_SELECTED_ID = '[Questionnaire] Set Selected Id',

  LOAD_GROUPS_REQUEST = '[Questionnaire] Load Groups Request',
  LOAD_GROUPS_FAILURE = '[Questionnaire] Load Groups Failure',
  LOAD_GROUPS_SUCCESS = '[Questionnaire] Load Groups Success',
  SORT_GROUPS_REQUEST = '[Questionnaire] Sort Groups Request',
  SORT_GROUPS_SUCCESS = '[Questionnaire] Sort Groups Success',

  ADD_OPENED_GROUP_ID = '[Questionnaire] Add Opened Group Id',
  REMOVE_OPENED_GROUP_ID = '[Questionnaire] Remove Opened Group Id',
  CLEAR_OPENED_GROUPS_IDS = '[Questionnaire] Clear Opened Groups Ids',
  ADD_SELECTED_GROUP_ID = '[Questionnaire] Add Selected Group Id',
  REMOVE_SELECTED_GROUP_ID = '[Questionnaire] Remove Selected Group Id',
  CLEAR_SELECTED_GROUPS_IDS = '[Questionnaire] Clear Selected Groups Ids',
  ADD_SELECTED_ITEM_ID = '[Questionnaire] Add Selected Item Id',
  REMOVE_SELECTED_ITEM_ID = '[Questionnaire] Remove Selected Item Id',
  CLEAR_SELECTED_ITEMS_IDS = '[Questionnaire] Clear Selected Items Ids',

  LOAD_UNASSIGNED_REQUEST = '[Questionnaire] Load Unassigned Request',
  LOAD_UNASSIGNED_FAILURE = '[Questionnaire] Load Unassigned Failure',
  LOAD_UNASSIGNED_SUCCESS = '[Questionnaire] Load Unassigned Success',
  SELECT_UNASSIGNED_REQUEST = '[Questionnaire] Select Unassigned Request',
  SELECT_UNASSIGNED_SUCCESS = '[Questionnaire] Select Unassigned Success',
  SET_SEARCH_VALUE = '[Questionnaire] Set search value',

  SET_SELECTED_TAB = '[Questionnaire] Set Selected tab',
  SET_COMPANY_ID = '[Questionnaire] Set Company Id',
  LOAD_USERS_REQUEST = '[Questionnaire] Load Users Request',
  LOAD_USERS_FAILURE = '[Questionnaire] Load Users Failure',
  LOAD_USERS_SUCCESS = '[Questionnaire] Load Users Success',
  SET_RES_COMPANY_ID = '[Questionnaire] Set Res Company Id',
  LOAD_RES_USERS_REQUEST = '[Questionnaire] Load Res Users Request',
  LOAD_RES_USERS_FAILURE = '[Questionnaire] Load Res Users Failure',
  LOAD_RES_USERS_SUCCESS = '[Questionnaire] Load Res Users Success',

  SET_HAS_UNSAVED_TEMPLATE = '[Questionnaire] Set has unsaved Template',
  ADD_UNSAVED_TEMPLATE = '[Questionnaire] Add unsaved Template',
  REMOVE_UNSAVED_TEMPLATE = '[Questionnaire] Remove unsaved Template',
  CLEAR_UNSAVED_TEMPLATES = '[Questionnaire] Clear unsaved Templates',
  SAVE_UNSAVED_TEMPLATES = '[Questionnaire] Save unsaved Templates',
  SAVE_UNSAVED_TEMPLATES_SUCCESS = '[Questionnaire] Save unsaved Templates Success',
  SAVE_UNSAVED_TEMPLATES_FAILURE = '[Questionnaire] Save unsaved Templates Failure',

  SET_FILTERED_USERS = '[Questionnaire] Set filtered users',
  SET_RES_FILTERED_USERS = '[Questionnaire] Set Res filtered users',
  SET_APPLIED_FILTERS = '[Questionnaire] Set applied filters',
  SET_RES_APPLIED_FILTERS = '[Questionnaire] Set Res applied filters',
  SET_SELECTED_USERS_IDS = '[Questionnaire] Set selected users ids',
  SET_RES_SELECTED_USERS_IDS = '[Questionnaire] Set Res selected users ids',

  SET_SELECT_CRITERIUM = '[Questionnaire] Set select criterium',
  SET_RES_SELECT_CRITERIUM = '[Questionnaire] Set Res select criterium',
  SET_SORT_CRITERIUM = '[Questionnaire] Set sort criterium',
  SET_RES_SORT_CRITERIUM = '[Questionnaire] Set Res sort criterium',
  SET_INV_TEMPLATE = '[Questionnaire] Set Invitation template',
  SET_REM_TEMPLATE = '[Questionnaire] Set Reminder template',
  SET_RES_TEMPLATE = '[Questionnaire] Set Result template',

  RESET = '[Questionnaire] reset',
}

/**
* Navbar actions
*/
/**Initiates load all questionnaires from DB action */
export class LoadRequestAction implements Action {
  readonly type = ActionTypes.LOAD_REQUEST;
}
/**Stores and broadcasts error loading questionnaires message */
export class LoadFailureAction implements Action {
  readonly type = ActionTypes.LOAD_FAILURE;
  constructor(public payload: { error: string }) {}
}
/**Stores and broadcasts questionnaires array state */
export class LoadSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SUCCESS;
  constructor(public payload: Questionnaire[] ) {}
}
/**Stores and broadcasts selected questionnaire id state */
export class SetSelectedIdAction implements Action {
  readonly type = ActionTypes.SET_SELECTED_ID;
  constructor(public payload: number) {}
}

/**
* Questions tab actions
*/
/**Initiates load all questionnaire (by id) groups (including questions for each group) from DB action */
export class LoadGroupsRequestAction implements Action {
  readonly type = ActionTypes.LOAD_GROUPS_REQUEST;
  constructor(public payload: number) {}
}
/**Stores and broadcasts error loading questionnaire groups message */
export class LoadGroupsFailureAction implements Action {
  readonly type = ActionTypes.LOAD_GROUPS_FAILURE;
  constructor(public payload: { error: string }) {}
}
/**Stores and broadcasts 'questions_groups' and 'sorted_groups' arrays states */
export class LoadGroupsSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_GROUPS_SUCCESS;
  constructor(public payload: {origin_groups: QuestionGroup[], sorted_groups: QuestionGroup[]} ) {}
}

export class SortGroupsRequestAction implements Action {
  readonly type = ActionTypes.SORT_GROUPS_REQUEST;
}

export class SortGroupsSuccessAction implements Action {
  readonly type = ActionTypes.SORT_GROUPS_SUCCESS;
  constructor(public payload: QuestionGroup[] ) {}
}

export class AddOpenedGroupIdAction implements Action {
  readonly type = ActionTypes.ADD_OPENED_GROUP_ID;
  constructor(public payload: number) {}
}

export class RemoveOpenedGroupIdAction implements Action {
  readonly type = ActionTypes.REMOVE_OPENED_GROUP_ID;
  constructor(public payload: number) {}
}

export class ClearOpenedGroupsIdsAction implements Action {
  readonly type = ActionTypes.CLEAR_OPENED_GROUPS_IDS;
}

export class AddSelectedItemIdAction implements Action {
  readonly type = ActionTypes.ADD_SELECTED_ITEM_ID;
  constructor(public payload: number) {}
}

export class RemoveSelectedItemIdAction implements Action {
  readonly type = ActionTypes.REMOVE_SELECTED_ITEM_ID;
  constructor(public payload: number) {}
}

export class ClearSelectedItemsIdsAction implements Action {
  readonly type = ActionTypes.CLEAR_SELECTED_ITEMS_IDS;
}

export class AddSelectedGroupIdAction implements Action {
  readonly type = ActionTypes.ADD_SELECTED_GROUP_ID;
  constructor(public payload: number) {}
}

export class RemoveSelectedGroupIdAction implements Action {
  readonly type = ActionTypes.REMOVE_SELECTED_GROUP_ID;
  constructor(public payload: number) {}
}

export class ClearSelectedGroupsIdsAction implements Action {
  readonly type = ActionTypes.CLEAR_SELECTED_GROUPS_IDS;
}

export class LoadUnassignedRequestAction implements Action {
  readonly type = ActionTypes.LOAD_UNASSIGNED_REQUEST;
}

export class LoadUnassignedFailureAction implements Action {
  readonly type = ActionTypes.LOAD_UNASSIGNED_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadUnassignedSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_UNASSIGNED_SUCCESS;
  constructor(public payload: {origin_questions: Question[], questions_with_selections: Question[]} ) {}
}

export class SelectUnassignedRequestAction implements Action {
  readonly type = ActionTypes.SELECT_UNASSIGNED_REQUEST;
}

export class SelectUnassignedSuccessAction implements Action {
  readonly type = ActionTypes.SELECT_UNASSIGNED_SUCCESS;
  constructor(public payload: Question[] ) {}
}

export class SetSelectedTabAction implements Action {
  readonly type = ActionTypes.SET_SELECTED_TAB;
  constructor(public payload: number) {}
}

export class SetSearchValueAction implements Action {
  readonly type = ActionTypes.SET_SEARCH_VALUE;
  constructor(public payload: string) {}
}

/**Invitation/result emails tab actions */
export class SetCompanyIdAction implements Action {
  readonly type = ActionTypes.SET_COMPANY_ID;
  constructor(public payload: number) {}
}

export class LoadUsersRequestAction implements Action {
  readonly type = ActionTypes.LOAD_USERS_REQUEST;
  constructor(public payload: number) {}
}

export class LoadUsersFailureAction implements Action {
  readonly type = ActionTypes.LOAD_USERS_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadUsersSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_USERS_SUCCESS;
  constructor(public payload: User[] ) {}
}

export class SetResCompanyIdAction implements Action {
  readonly type = ActionTypes.SET_RES_COMPANY_ID;
  constructor(public payload: number) {}
}

export class LoadResUsersRequestAction implements Action {
  readonly type = ActionTypes.LOAD_RES_USERS_REQUEST;
  constructor(public payload: number) {}
}

export class LoadResUsersFailureAction implements Action {
  readonly type = ActionTypes.LOAD_RES_USERS_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadResUsersSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_RES_USERS_SUCCESS;
  constructor(public payload: User[] ) {}
}


export class SetHasUnsavedTemplateAction implements Action {
  readonly type = ActionTypes.SET_HAS_UNSAVED_TEMPLATE;
  constructor(public payload: boolean) {}
}
export class AddUnsavedTemplateAction implements Action {
  readonly type = ActionTypes.ADD_UNSAVED_TEMPLATE;
  constructor(public payload: SendEmailTemplate) {}
}
export class RemoveUnsavedTemplateAction implements Action {
  readonly type = ActionTypes.REMOVE_UNSAVED_TEMPLATE;
  constructor(public payload: SendEmailTemplate) {}
}
export class ClearUnsavedTemplatesAction implements Action {
  readonly type = ActionTypes.CLEAR_UNSAVED_TEMPLATES;
}
export class SaveUnsavedTemplatesAction implements Action {
  readonly type = ActionTypes.SAVE_UNSAVED_TEMPLATES;
  constructor(public payload: SendEmailTemplate[]) {}
}
export class SaveUnsavedTemplatesSuccessAction implements Action {
  readonly type = ActionTypes.SAVE_UNSAVED_TEMPLATES_SUCCESS;
}
export class SaveUnsavedTemplatesFailureAction implements Action {
  readonly type = ActionTypes.SAVE_UNSAVED_TEMPLATES_FAILURE;
  constructor(public payload: string) {}
}


export class SetFilteredUsers implements Action {
  readonly type = ActionTypes.SET_FILTERED_USERS;
  constructor(public payload: User[]) {}
}

export class SetResFilteredUsers implements Action {
  readonly type = ActionTypes.SET_RES_FILTERED_USERS;
  constructor(public payload: User[]) {}
}

export class SetAppliedFilters implements Action {
  readonly type = ActionTypes.SET_APPLIED_FILTERS;
  constructor(public payload: {}) {}
}

export class SetResAppliedFilters implements Action {
  readonly type = ActionTypes.SET_RES_APPLIED_FILTERS;
  constructor(public payload: {}) {}
}

export class SetSelectedUsersIds implements Action {
  readonly type = ActionTypes.SET_SELECTED_USERS_IDS;
  constructor(public payload: number[]) {}
}

export class SetResSelectedUsersIds implements Action {
  readonly type = ActionTypes.SET_RES_SELECTED_USERS_IDS;
  constructor(public payload: number[]) {}
}

export class SetSelectCriterium implements Action {
  readonly type = ActionTypes.SET_SELECT_CRITERIUM;
  constructor(public payload: SelectStatusesEnum) {}
}

export class SetResSelectCriterium implements Action {
  readonly type = ActionTypes.SET_RES_SELECT_CRITERIUM;
  constructor(public payload: SelectStatusesEnum) {}
}

export class SetSortCriterium implements Action {
  readonly type = ActionTypes.SET_SORT_CRITERIUM;
  constructor(public payload: SortStatusesEnum) {}
}

export class SetResSortCriterium implements Action {
  readonly type = ActionTypes.SET_RES_SORT_CRITERIUM;
  constructor(public payload: SortStatusesEnum) {}
}

export class SetInvTemplateAction implements Action {
  readonly type = ActionTypes.SET_INV_TEMPLATE;
  constructor(public payload: SendEmailTemplate) {}
}
export class SetRemTemplateAction implements Action {
  readonly type = ActionTypes.SET_REM_TEMPLATE;
  constructor(public payload: SendEmailTemplate) {}
}
export class SetResTemplateAction implements Action {
  readonly type = ActionTypes.SET_RES_TEMPLATE;
  constructor(public payload: SendEmailTemplate) {}
}

export class ResetAction implements Action {
  readonly type = ActionTypes.RESET;
}

export type Actions =
  LoadRequestAction |
  LoadFailureAction |
  LoadSuccessAction |
  SetSelectedIdAction |

  LoadGroupsRequestAction |
  LoadGroupsFailureAction |
  LoadGroupsSuccessAction |
  SortGroupsRequestAction |
  SortGroupsSuccessAction |

  AddOpenedGroupIdAction |
  RemoveOpenedGroupIdAction |
  ClearOpenedGroupsIdsAction |
  AddSelectedItemIdAction |
  RemoveSelectedItemIdAction |
  ClearSelectedItemsIdsAction |
  AddSelectedGroupIdAction |
  RemoveSelectedGroupIdAction |
  ClearSelectedGroupsIdsAction |

  LoadUnassignedRequestAction |
  LoadUnassignedFailureAction |
  LoadUnassignedSuccessAction |
  SelectUnassignedRequestAction |
  SelectUnassignedSuccessAction |

  SetSelectedTabAction |
  SetSearchValueAction |

  SetCompanyIdAction |
  LoadUsersRequestAction |
  LoadUsersFailureAction |
  LoadUsersSuccessAction |

  SetHasUnsavedTemplateAction |
  AddUnsavedTemplateAction |
  RemoveUnsavedTemplateAction |
  ClearUnsavedTemplatesAction |
  SaveUnsavedTemplatesAction |
  SaveUnsavedTemplatesSuccessAction |
  SaveUnsavedTemplatesFailureAction |

  SetResCompanyIdAction |
  LoadResUsersRequestAction |
  LoadResUsersFailureAction |
  LoadResUsersSuccessAction |
  SetFilteredUsers |
  SetResFilteredUsers |
  SetAppliedFilters |
  SetResAppliedFilters |
  SetSelectedUsersIds |
  SetResSelectedUsersIds |
  SetResSelectCriterium |
  SetSelectCriterium |
  SetResSelectCriterium |
  SetSortCriterium |
  SetResSortCriterium |
  SetInvTemplateAction |
  SetRemTemplateAction |
  SetResTemplateAction |

  ResetAction;
