import { QuestionQroupQuestionMap, Question } from '@app/models';
/**
 * Model contains all fields from 'question_groups' DB table
 * + QuestionQroupQuestionMap array ('question_groups_questions_maps' DB table)
 * + Question array ('questions' DB table)
 * + alowDrop, opened and selected fields
 */

export interface QuestionGroup {
  id: number;
  questionnaire_id: number;
  title: string;
  description: string;
  order_pos: number;
  is_active: number;
  selected: boolean;
  opened: boolean;
  group_questions_map: QuestionQroupQuestionMap[];
  questions: Question[];
  alowDrop: boolean;
}
