import { Action } from '@ngrx/store';
import { TrainingCourse } from '@app/models';

export enum ActionTypes {
  LOAD_REQUEST = '[Training Course] Load Request',
  LOAD_FAILURE = '[Training Course] Load Failure',
  LOAD_SUCCESS = '[Training Course] Load Success',
  SET_SELECTED_TRAINING_COURSE = '[Training Course] Set selected Training Course',
  SET_FILTER_VALUE = '[Training Course] Set filter value'
}

export class LoadRequestAction implements Action {
  readonly type = ActionTypes.LOAD_REQUEST;
}

export class LoadFailureAction implements Action {
  readonly type = ActionTypes.LOAD_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SUCCESS;
  constructor(public payload: TrainingCourse[] ) {}
}

export class SetSelectedTrainingCourseAction implements Action {
  readonly type = ActionTypes.SET_SELECTED_TRAINING_COURSE;
  constructor(public payload: TrainingCourse) {}
}

export class SetFilterValueAction implements Action {
  readonly type = ActionTypes.SET_FILTER_VALUE;
  constructor(public payload: string) {}
}

export type Actions =
  LoadRequestAction |
  LoadFailureAction |
  LoadSuccessAction |
  SetSelectedTrainingCourseAction |
  SetFilterValueAction;
