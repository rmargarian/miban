import { UserAnswerOption } from '@app/models';

/**
 * Model contains all fields from 'user_answers' DB table
 * + UserAnswerOption array ('user_answer_options' DB table)
 */

export interface UserAnswer {
  id: number;
  question_id: number;
  attempt_id: number;
  comment: string;
  answer: string;
  answer_options: UserAnswerOption[];
}

