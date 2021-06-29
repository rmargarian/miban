import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.SET_FILTER_VALUE: {
      return {
        ...state,
        filterValue: action.payload
      };
    }
    case ActionTypes.SET_SELECTED_ADMIN: {
      return {
        ...state,
        selectedUserAdmin: action.payload
      };
    }
    case ActionTypes.SET_SORT_COLUMN: {
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
