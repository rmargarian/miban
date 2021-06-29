import { IncompleteAttempt } from '@app/models';

export interface State {
  error?: any;
  loading?: boolean;
  attempts: IncompleteAttempt[];
  questionnaireId: number;
  selectedIds: number[];
}

export const initialState: State = {
  error: null,
  loading: false,
  attempts: [],
  questionnaireId: NaN,
  selectedIds: []
};
