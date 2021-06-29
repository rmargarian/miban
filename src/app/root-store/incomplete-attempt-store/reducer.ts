import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LOAD_REQUEST: {
      return {
        ...state,
        loading: true,
        error: null,
        attempts: null,
        questionnaireId: action.payload
      };
    }
    case ActionTypes.LOAD_SUCCESS: {
      return  {
        ...state,
        attempts: action.payload,
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
        questionnaireId: NaN,
        attempts: [],
        selectedIds: []
      };
    }
    case ActionTypes.SET_QUESTIONNAIRE_ID: {
      return {
        ...state,
        selectedIds: [],
        questionnaireId: action.payload
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
    default: {
      return state;
    }
  }
}
