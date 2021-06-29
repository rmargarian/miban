import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.SET_MAIN_ROUTE: {
      return {
        ...state,
        mainRoute: action.payload
      };
    }
    case ActionTypes.SET_CHILD_ROUTE: {
      return {
        ...state,
        childRoute: action.payload
      };
    }
    case ActionTypes.NAVIGATE: {
      return {
        ...state,
        //childRoute: action.payload.path,
        //param: action.payload.param
      };
    }
    case ActionTypes.NAVIGATE_SUCCESS: {
      return  {
        ...state
      };
    }
    default: {
      return state;
    }
  }
}
