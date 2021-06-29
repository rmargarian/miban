import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LOAD_REQUEST: {
      return {
        ...state,
        loading: true,
        error: null,
        users: null,
        companyQuests: null,
        companyId: action.payload
      };
    }
    case ActionTypes.LOAD_SUCCESS: {
      return  {
        ...state,
        users: action.payload,
        loading: false,
        error: null
      };
    }
    case ActionTypes.LOAD_FAILURE: {
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    }
    case ActionTypes.RESET: {
      return {
        ...state,
        error: null,
        loading: false,
        companyId: NaN,
        users: [],
        companyQuests: [],
        selectedIds: [],
        filterValue: ''
      };
    }
    case ActionTypes.SET_SHOW_ALL: {
      return {
        ...state,
        showAll: action.payload
      };
    }
    case ActionTypes.TRIGGER_SHOW_ALL: {
      return {
        ...state,
        showAll: !state.showAll
      };
    }
    case ActionTypes.SET_COMPANY_ID: {
      return {
        ...state,
        selectedIds: [],
        companyId: action.payload
      };
    }
    case ActionTypes.SET_QUESTIONNAIRES: {
      return {
        ...state,
        companyQuests: action.payload || []
      };
    }
    case ActionTypes.SET_SELECTED_IDS: {
      return {
        ...state,
        selectedIds: action.payload
      };
    }
    case ActionTypes.TRIGGER_LOADING: {
      return {
        ...state,
        loading: action.payload
      };
    }
    case ActionTypes.SET_FILTER_VALUE: {
      return {
        ...state,
        filterValue: action.payload
      };
    }
    case ActionTypes.SET_SORT_COLUMN_USER: {
      return {
        ...state,
        sortColumn: action.payload
      };
    }
    default: {
      return state;
    }
  }
}
