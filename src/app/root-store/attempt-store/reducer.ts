import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LOAD_USER_REQUEST: {
      return {
        ...state,
        user: null,
        userLoading: true
      };
    }
    case ActionTypes.LOAD_USER_ATTEMPTS_REQUEST: {
      return {
        ...state,
        user: null,
        userLoading: true
      };
    }
    case ActionTypes.LOAD_USER_SUCCESS: {
      return  {
        ...state,
        user: action.payload,
        userLoading: false
      };
    }
    case ActionTypes.LOAD_USER_FAILURE: {
      return {
        ...state,
        userLoading: false
      };
    }
    case ActionTypes.LOAD_KEY_REQUEST: {
      return {
        ...state,
        key: null,
        keyLoading: true
      };
    }
    case ActionTypes.LOAD_KEY_SUCCESS: {
      return  {
        ...state,
        key: action.payload,
        keyLoading: false
      };
    }
    case ActionTypes.LOAD_KEY_FAILURE: {
      return {
        ...state,
        keyLoading: false
      };
    }
    case ActionTypes.SET_ERROR: {
      return {
        ...state,
        error: action.payload
      };
    }
    case ActionTypes.SET_QUESTIONNAIRE_ID: {
      return {
        ...state,
        questionnaireId: action.payload
      };
    }
    case ActionTypes.SET_USER_ID: {
      return {
        ...state,
        userId: action.payload
      };
    }
    case ActionTypes.SET_NOT_REGISTRED: {
      const user = action.payload ? null : state.user;
      return  {
        ...state,
        user: user,
        notRegistred: action.payload
      };
    }
    case ActionTypes.NAVIGATE: {
      return {
        ...state
      };
    }
    case ActionTypes.NAVIGATE_SUCCESS: {
      return  {
        ...state
      };
    }
    case ActionTypes.SET_SECRET_KEY: {
      return {
        ...state,
        secretKey: action.payload
      };
    }
    case ActionTypes.SET_ENTERED_EMAIL: {
      return {
        ...state,
        enteredEmail: action.payload
      };
    }
    case ActionTypes.SET_IS_ADMIN: {
      return {
        ...state,
        isAdmin: action.payload
      };
    }
    case ActionTypes.SET_UNSUB_EMAIL: {
      return {
        ...state,
        unsubEmail: action.payload
      };
    }

    case ActionTypes.SET_RES_REPORT_CODE: {
      return {
        ...state,
        resReportCode: action.payload
      };
    }

    case ActionTypes.LOAD_GROUPS_REQUEST: {
      return {
        ...state,
        groupsLoading: true
      };
    }
    case ActionTypes.LOAD_GROUPS_SUCCESS: {
      return {
        ...state,
        questions_groups: action.payload,
        groupsLoading: false
      };
    }
    case ActionTypes.LOAD_GROUPS_FAILURE: {
      return {
        ...state,
        groupsLoading: false
      };
    }
    default: {
      return state;
    }
  }
}
