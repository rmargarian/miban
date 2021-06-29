import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Question } from '@app/models';

export const featureAdapter: EntityAdapter<Question> = createEntityAdapter<Question>({
  selectId: model => model.id,
  sortComparer: false
});

export interface State extends EntityState<Question> {
  error?: any;
  filterValue: string;
  selectedQuestion: Question;
  questions: Question[];
  scrollToIndex: number;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    error: null,
    filterValue: undefined,
    selectedQuestion: undefined,
    questions: undefined,
    scrollToIndex: -1
  }
);


