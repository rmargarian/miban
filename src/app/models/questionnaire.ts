import { QuestionnaireType } from '@app/enums';
import { QuestionGroup } from '@app/models';

/**
 * Contains all fields from 'questionnaires' DB table
 * + QuestionGroup array ('question_groups' DB table) - All question groups created in questionnaire
 *  and 'selected' field
 */
export interface Questionnaire {
  id: number;
  type: QuestionnaireType;
  typeStr: string;
  title: string;
  description: string;
  abbreviation: string;
  welcome: string;
  email_from: string;
  inv_email_subject: string;
  inv_email_template: string;
  rem_email_subject: string;
  rem_email_template: string;
  conf_email_subject: string;
  conf_email_template: string;
  pubreg_email_subject: string;
  pubreg_email_template: string;
  sponsor_email_subject: string;
  sponsor_email_template: string;
  incomplete_timeout: number;
  deleted: boolean;
  q_groups: QuestionGroup[];
  selected: boolean;
}

