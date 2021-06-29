import { Actions, ActionTypes } from './actions';
import { featureAdapter, initialState, State } from './state';
import { SelectStatusesEnum, SortStatusesEnum, QuestionnaireTabs } from '@app/enums';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LOAD_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.LOAD_SUCCESS: {
      return featureAdapter.addAll(
        action.payload, {
        ...state,
        isLoading: false,
        error: null
      });
    }
    case ActionTypes.LOAD_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }
    case ActionTypes.SET_SELECTED_ID: {
      return {
        ...state,
        selectedId: action.payload
      };
    }

    /**Questions tab reducers */
    case ActionTypes.LOAD_GROUPS_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.LOAD_GROUPS_SUCCESS: {
      return {
        ...state,
        questions_groups: action.payload.origin_groups,
        sorted_groups: action.payload.sorted_groups,
        error: null
      };
    }
    case ActionTypes.LOAD_GROUPS_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }
    case ActionTypes.SORT_GROUPS_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.SORT_GROUPS_SUCCESS: {
      return {
        ...state,
        sorted_groups: action.payload,
        error: null
      };
    }

    case ActionTypes.ADD_OPENED_GROUP_ID: {
      return {
        ...state,
        opened_groups_ids: [...state.opened_groups_ids, action.payload]
      };
    }
    case ActionTypes.REMOVE_OPENED_GROUP_ID: {
      const prunedIds = state.opened_groups_ids.filter(item => {
        return item !== action.payload;
      });
      return {
        ...state,
        opened_groups_ids: prunedIds
      };
    }
    case ActionTypes.CLEAR_OPENED_GROUPS_IDS: {
      return {
        ...state,
        opened_groups_ids: []
      };
    }
    case ActionTypes.ADD_SELECTED_ITEM_ID: {
      return {
        ...state,
        selected_items_ids: [...state.selected_items_ids, action.payload],
        selected_groups_ids: []
      };
    }
    case ActionTypes.REMOVE_SELECTED_ITEM_ID: {
      const prunedIds = state.selected_items_ids.filter(item => {
        return item !== action.payload;
      });
      return {
        ...state,
        selected_items_ids: prunedIds
      };
    }
    case ActionTypes.CLEAR_SELECTED_ITEMS_IDS: {
      return {
        ...state,
        selected_items_ids: []
      };
    }

    case ActionTypes.ADD_SELECTED_GROUP_ID: {
      return {
        ...state,
        selected_groups_ids: [...state.selected_groups_ids, action.payload],
        selected_items_ids: []
      };
    }
    case ActionTypes.REMOVE_SELECTED_GROUP_ID: {
      const prunedIds = state.selected_groups_ids.filter(item => {
        return item !== action.payload;
      });
      return {
        ...state,
        selected_groups_ids: prunedIds
      };
    }
    case ActionTypes.CLEAR_SELECTED_GROUPS_IDS: {
      return {
        ...state,
        selected_groups_ids: []
      };
    }

    case ActionTypes.LOAD_UNASSIGNED_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.LOAD_UNASSIGNED_SUCCESS: {
      return {
        ...state,
        unassignedQuestions: action.payload.origin_questions,
        unassignedQuestionsSelected: action.payload.questions_with_selections,
        error: null
      };
    }
    case ActionTypes.LOAD_UNASSIGNED_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }
    case ActionTypes.SELECT_UNASSIGNED_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.SELECT_UNASSIGNED_SUCCESS: {
      return {
        ...state,
        unassignedQuestionsSelected: action.payload,
        error: null
      };
    }

    case ActionTypes.SET_SELECTED_TAB: {
      return {
        ...state,
        selectedTab: action.payload
      };
    }
    case ActionTypes.SET_SEARCH_VALUE: {
      return {
        ...state,
        searchValue: action.payload
      };
    }

    /**Invitation/result emails tab redusers */
    case ActionTypes.SET_COMPANY_ID: {
      const users = action.payload ? state.users : null;
      return {
        ...state,
        companyId: action.payload,
        users: users
      };
    }
    case ActionTypes.LOAD_USERS_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.LOAD_USERS_SUCCESS: {
      return {
        ...state,
        users: action.payload,
        error: null
      };
    }
    case ActionTypes.LOAD_USERS_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }

    case ActionTypes.SET_RES_COMPANY_ID: {
      const users = action.payload ? state.resUsers : null;
      return {
        ...state,
        resCompanyId: action.payload,
        resUsers: users
      };
    }
    case ActionTypes.LOAD_RES_USERS_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.LOAD_RES_USERS_SUCCESS: {
      return {
        ...state,
        resUsers: action.payload,
        error: null
      };
    }
    case ActionTypes.LOAD_RES_USERS_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }


    case ActionTypes.SET_HAS_UNSAVED_TEMPLATE: {
      return {
        ...state,
        hasUnsavedTemplate: action.payload
      };
    }
    case ActionTypes.ADD_UNSAVED_TEMPLATE: {
      return {
        ...state,
        unsavedTemplates: [...state.unsavedTemplates, action.payload]
      };
    }
    case ActionTypes.REMOVE_UNSAVED_TEMPLATE: {
      const prunedTemplates = state.unsavedTemplates.filter(item => {
        return item.id !== action.payload.id;
      });
      return {
        ...state,
        unsavedTemplates: prunedTemplates
      };
    }
    case ActionTypes.CLEAR_UNSAVED_TEMPLATES: {
      return {
        ...state,
        unsavedTemplates: []
      };
    }
    case ActionTypes.SAVE_UNSAVED_TEMPLATES: {
      return {
        ...state
      };
    }
    case ActionTypes.SAVE_UNSAVED_TEMPLATES_SUCCESS: {
      return {
        ...state,
        unsavedTemplates: []
      };
    }
    case ActionTypes.SAVE_UNSAVED_TEMPLATES_FAILURE: {
      return {
        ...state,
        unsavedTemplates: [],
        error: action.payload
      };
    }


    case ActionTypes.SET_FILTERED_USERS: {
      return {
        ...state,
        filteredUsers: action.payload
      };
    }
    case ActionTypes.SET_RES_FILTERED_USERS: {
      return {
        ...state,
        resFilteredUsers: action.payload
      };
    }

    case ActionTypes.SET_APPLIED_FILTERS: {
      return {
        ...state,
        appliedFilters: action.payload
      };
    }
    case ActionTypes.SET_RES_APPLIED_FILTERS: {
      return {
        ...state,
        resAppliedFilters: action.payload
      };
    }

    case ActionTypes.SET_SELECTED_USERS_IDS: {
      return {
        ...state,
        selectedUsersIds: action.payload
      };
    }
    case ActionTypes.SET_RES_SELECTED_USERS_IDS: {
      return {
        ...state,
        resSelectedUsersIds: action.payload
      };
    }

    case ActionTypes.SET_SELECT_CRITERIUM: {
      return {
        ...state,
        selectCriterium: action.payload
      };
    }
    case ActionTypes.SET_RES_SELECT_CRITERIUM: {
      return {
        ...state,
        resSelectCriterium: action.payload
      };
    }

    case ActionTypes.SET_SORT_CRITERIUM: {
      return {
        ...state,
        sortCriterium: action.payload
      };
    }
    case ActionTypes.SET_RES_SORT_CRITERIUM: {
      return {
        ...state,
        resSortCriterium: action.payload
      };
    }

    case ActionTypes.SET_INV_TEMPLATE: {
      return {
        ...state,
        invTemplate: action.payload
      };
    }
    case ActionTypes.SET_REM_TEMPLATE: {
      return {
        ...state,
        remTemplate: action.payload
      };
    }
    case ActionTypes.SET_RES_TEMPLATE: {
      return {
        ...state,
        resTemplate: action.payload
      };
    }
    /**Resets Questions and Invitation/Result Emails tabs data */
    case ActionTypes.RESET: {
      sessionStorage.removeItem('lastFilterTypeRes');
      sessionStorage.removeItem('lastFilterType');
      return {
        ...state,
        error: null,
        questions_groups: [],
        opened_groups_ids: [],
        selected_groups_ids: [],
        selected_items_ids: [],
        unassignedQuestions: [],
        searchValue: '',

        selectedTab: QuestionnaireTabs.SETUP,
        companyId: NaN,
        users: null,
        resCompanyId: NaN,
        resUsers: [],
        hasUnsavedTemplate: false,
        filteredUsers: [],
        resFilteredUsers: [],
        appliedFilters: {
          p_location: [],
          p_date: [],
          p_groups: [],
          p_saved: []
        },
        resAppliedFilters: {
          p_location: [],
          p_date: [],
          p_groups: [],
          p_saved: []
        },
        selectedUsersIds: [],
        resSelectedUsersIds: [],
        selectCriterium: SelectStatusesEnum.INCOMPLETE,
        resSelectCriterium: SelectStatusesEnum.COMPLETE,
        sortCriterium: SortStatusesEnum.FIRST,
        resSortCriterium: SortStatusesEnum.FIRST,
        invTemplate: null,
        remTemplate: null,
        resTemplate: null
      };
    }
    default: {
      return state;
    }
  }
}
