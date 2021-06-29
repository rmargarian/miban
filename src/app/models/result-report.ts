import { Questionnaire } from '@app/models';

/**
 * Model contains all fields from 'result_reports' DB table
 * + Questionnaire object ('questionnaires' DB table)
 */

export interface ResultReport {
  id: number;
  user_id: number;
  questionnaire_id: number;
  code: string;
  score: string;
  html: string;
  with_faces: boolean;
  questionnaire: Questionnaire;
}
