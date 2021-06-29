import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.TRIGGER_SHOW_ALL: {
      return {
        ...state,
        showAll: !state.showAll
      };
    }
    case ActionTypes.SET_SHOW_ALL: {
      return {
        ...state,
        showAll: action.payload
      };
    }
    case ActionTypes.SET_SELECTED_KEY: {
      return {
        ...state,
        selectedKey: action.payload
      };
    }
    case ActionTypes.SET_SORT_COLUMN: {
      return {
        ...state,
        sortColumn: action.payload
      };
    }
    case ActionTypes.SET_FILTER_VALUE: {
      return {
        ...state,
        filterValue: action.payload
      };
    }
    case ActionTypes.LOAD_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.LOAD_SUCCESS: {
      return {
        ...state,
        error: null,
        keys: action.payload
      };
    }
    case ActionTypes.LOAD_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }
    case ActionTypes.LOAD_SHARED_REQUEST: {
      return {
        ...state,
        error: null,
        keysFullList: undefined,
        keysShortList: undefined,
        keysLoaded: false
      };
    }
    case ActionTypes.LOAD_SHARED_SUCCESS: {
      return {
        ...state,
        error: null,
        keysFullList: action.payload.fullList,
        keysShortList: action.payload.shortList,
        keysLoaded: true
      };
    }
    case ActionTypes.LOAD_SHARED_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }
    default: {
      return state;
    }
  }
}
