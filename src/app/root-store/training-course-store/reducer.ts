import { Actions, ActionTypes } from './actions';
import { featureAdapter, initialState, State } from './state';

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
        error: null
      });
    }
    case ActionTypes.LOAD_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }
    case ActionTypes.SET_FILTER_VALUE: {
      return {
        ...state,
        filterValue: action.payload
      };
    }
    case ActionTypes.SET_SELECTED_TRAINING_COURSE: {
      return {
        ...state,
        selectedTrainingCourse: action.payload
      };
    }
    default: {
      return state;
    }
  }
}
