import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { TrainingCourse } from '@app/models';
import { featureAdapter, State } from './state';

export const selectTrainingCourseState: MemoizedSelector<object, State> = createFeatureSelector<State>('training-course');
export const selectAll: (state: object) => TrainingCourse[] = featureAdapter.getSelectors(selectTrainingCourseState).selectAll;
export const selectTrainingCourseById = (id: number) =>
  createSelector(this.selectAllTrainingCourseItems, (allTrainingCourses: TrainingCourse[]) => {
    if (allTrainingCourses) {
      return allTrainingCourses.find(p => p.id === id);
    } else {
      return null;
    }
  });

const getSelectedTrainingCourse = (state: State): TrainingCourse => state.selectedTrainingCourse;
const getFilterValue = (state: State): string => state.filterValue;
const getTrainingCourses = (state: State): TrainingCourse[] => state.courses;

export const selectSelectedTrainingCourse: MemoizedSelector<object, TrainingCourse> =
  createSelector(selectTrainingCourseState, getSelectedTrainingCourse);
export const selectTrainingCourseFilterValue: MemoizedSelector<object, string> =
  createSelector(selectTrainingCourseState, getFilterValue);
export const selectTrainingCourses: MemoizedSelector<object, TrainingCourse[]> =
  createSelector(selectTrainingCourseState, getTrainingCourses);
