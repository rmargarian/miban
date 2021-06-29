import { UserQuestionnaireAttemptsLimit, UserAnswer } from '@app/models';

/**
 * Model contains all fields from 'attempts' DB table
 * + UserQuestionnaireAttemptsLimit array ('users_questionnaire_attempt_limit' DB table)
 * + UserAnswer array ('user_answers' DB table)
 */

export interface Attempt {
  id: number;
  user_id: number;
  questionnaire_id: number;
  start_date: Date;
  end_date: Date;
  last_activity_date: Date;
  is_note_sent: number;
  passed_time: number;
  status: number;
  attemts_limit: UserQuestionnaireAttemptsLimit[];
  answers: UserAnswer[];
}
