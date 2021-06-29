import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LOAD_REQUEST: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.LOAD_SUCCESS: {
      return  {
        ...state,
        countries: action.payload.countries,
        countriesStates: action.payload.countriesStates,
        currencies: action.payload.currencies,
        careers: action.payload.careers,
        error: null
      };
    }
    case ActionTypes.LOAD_FAILURE: {
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
