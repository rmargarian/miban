import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { TrainingCourse } from '@app/models';

export const featureAdapter: EntityAdapter<TrainingCourse> = createEntityAdapter<TrainingCourse>({
  selectId: model => model.id,
  sortComparer: false
});

export interface State extends EntityState<TrainingCourse> {
  selectedTrainingCourse: TrainingCourse;
  filterValue: string;
  courses: TrainingCourse[];
  error?: any;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    selectedTrainingCourse: undefined,
    filterValue: undefined,
    courses: undefined,
    error: null
  }
);
