import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.SET_COMPANY_ID: {
      return {
        ...state,
        companyId: action.payload
      };
    }
    case ActionTypes.SET_USERS: {
      return {
        ...state,
        users: action.payload || []
      };
    }
    case ActionTypes.SET_FILE: {
      return {
        ...state,
        file: action.payload
      };
    }
    case ActionTypes.SET_SHOW_SECOND: {
      return {
        ...state,
        showSecond: action.payload
      };
    }
    case ActionTypes.SET_SHOW_THIRD: {
      return {
        ...state,
        showThird: action.payload
      };
    }
    case ActionTypes.RESET: {
      return {
        ...state,
        showSecond: false,
        showThird: false,
        companyId: NaN,
        users: [],
        file: undefined
      };
    }
    default: {
      return state;
    }
  }
}
