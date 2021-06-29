import { UserStoreState } from './user-store';
import { RouteStoreState } from './route-store';
import { QuestionnaireStoreState } from './questionnaire-store';
import { UserAdminStoreModule } from '@app/root-store/user-admin-store';
import { TrainingCourseStoreState } from './training-course-store';
import { QuestionStoreState } from './question-store';
import { AttemptStoreState } from './attempt-store';
import { KeysStoreState } from './keys-store';
import { ImportStoreState } from './import-store';
import { IncompleteAttemptStoreState } from './incomplete-attempt-store';
import { SharedStoreState } from './shared-store';

export interface State {
  user: UserStoreState.State;
  user_admin: UserAdminStoreModule;
  training_course: TrainingCourseStoreState.State;
  route: RouteStoreState.State;
  questionnaire: QuestionnaireStoreState.State;
  question: QuestionStoreState.State;
  attempt: AttemptStoreState.State;
  key: KeysStoreState.State;
  import: ImportStoreState.State;
  incomplete_attempt: IncompleteAttemptStoreState.State;
  shared: SharedStoreState.State;
}
