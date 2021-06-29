import { Questionnaire } from '@app/models';

/**
 * Model contains all fields from 'incompete_attempts' DB table
 * + Questionnaire ('questionnaires' DB table)
 */

export interface IncompleteAttempt {
  id: number;
  questionnaire_id: number;
  status: number;
  ip: string;
  country: string;
  state: string;
  city: string;
  browser: string;
  responses: number;
  createdAt: Date;
  updatedAt: Date;
  questionnaire: Questionnaire;
}
