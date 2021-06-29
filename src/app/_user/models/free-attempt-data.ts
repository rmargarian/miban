import { Attempt, User, IncompleteAttempt } from '@app/models';

export interface FreeAttemptData {
  attempt: Attempt;
  incompleteAttempt: IncompleteAttempt;
  qId: number;
  kId: number;
  currPage: number;
  YPos: number;
  isFinished: boolean;
  user: User;
}
