import { SortOptions } from '@app/enums';
import { Questionnaire } from '@app/models';

export * from './components/button/button.interfaces';

export interface SortColumn {
  colId: string;
  sort: SortOptions;
}

export interface Position {
  x: number;
  y: number;
}

export interface QuestionnairesByType {
  profiles: Questionnaire[];
  assessments: Questionnaire[];
  feedbacks: Questionnaire[];
}

