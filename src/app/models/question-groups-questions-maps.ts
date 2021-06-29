import { Question } from '@app/models';
/**
 * Model contains all fields from 'question_groups_questions_maps' DB table
 * + Question object ('questions' DB table)
 * + selected and hidden fields
 */
export interface QuestionQroupQuestionMap {
  question_group_id: number;
  question_id: number;
  question_order: number;
  question: Question;
  selected: boolean;
  hidden: boolean;
}
