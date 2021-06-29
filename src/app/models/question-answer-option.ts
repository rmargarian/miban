/**
 * Model contains all fields from 'question_answer_options' DB table
 * + hided option
 */

export interface QuestionAnswerOption {
  id: number;
  question_id: number;
  order_pos: number;
  title: string;
  correct_answer: number;
  score: number;
  face_type: number;
  qcategory: number;
  hided: boolean;
}
