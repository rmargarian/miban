import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Question, QuestionsCategories } from '../models';
import { SliderTag } from '@app/models';
import { QuestionGraphType } from '@app/enums';
import { catchError } from 'rxjs/internal/operators';
import { handleError } from '@app/services/error-handler';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private http: HttpClient) {
  }

  /**
   * Get all questions, without or with questionnaires, that they were attached to
   * @param {String[]} fields
   * @param {boolean} includeQuestionnaires
   * @returns {Observable<Question[]>}
   */
  getAll(fields: String[], includeQuestionnaires?: boolean): Observable<Question[]> {
    const restrictFieldsParam = fields ? 'fields=' + fields : '';
    const includeQuestionnairesParam = includeQuestionnaires ? 'include_questionnaires=true' : '';
    return this.http.get<Question[]>(`/api/questions/get-all?${restrictFieldsParam}${restrictFieldsParam ? '&' : ''}${includeQuestionnairesParam}`);
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>('/api/questions/' + id);
  }

  getLabelSetOptions(): Observable<any[]> {
    return this.http.get<any[]>('/api/question-label-options');
  }

  getSliderTags(id: number): Observable<SliderTag[]> {
    return this.http.get<SliderTag[]>('/api/question-slider-tags/' + id);
  }

  getOptionsByLabelSetId(id: number): Observable<any[]> {
    return this.http.get<any[]>('/api/question/label-options-by-id/' + id);
  }

  createNewLabelSet(data: any): Observable<any> {
    return this.http.post('/api/question/create-label-set', data)
      .pipe(catchError(handleError));
  }

  updateLabelSet(data: any): Observable<void> {
    return this.http.put<void>('/api/question/update-label-set/', data);
  }

  deleteLabelSet(id: number): Observable<void> {
    return this.http.delete<void>('/api/question/delete-label-set/' + id);
  }

  /**
   * Values for questionnaire types select
   * @returns {[{text: string; id: number} , {text: string; id: number} , {text: string; id: number}]}
   */
  getQuestionnairesType() {
    return [
      {text: 'Profile', id: 2},
      {text: 'Assessments', id: 1},
      {text: 'Feedback', id: 3}
    ];
  }

  /**
   * Values for questions types select
   */
  getQuestionAnswerType() {
    return [
      {text: 'Multiple choice: multi options', id: 1},
      {text: 'Multiple choice: single option', id: 2},
      {text: 'Array', id: 3},
      {text: 'Order', id: 4},
      {text: 'Text', id: 5},
      {text: 'Numeric', id: 6},
      {text: 'Slider', id: 8}
    ];
  }

  /**
   * Values for array question type graph types select
   * @returns {[{text: string; id: QuestionGraphType} , {text: string; id: QuestionGraphType} , {text: string; id: QuestionGraphType}]}
   */
  getQuestionGraphTypeforArray() {
    return [
      {text: 'Bar Plot', id: QuestionGraphType.BAR},
      {text: 'Bar Plot Horizontal', id: QuestionGraphType.BAR_HORIZONTAL},
      {text: 'Radar', id: QuestionGraphType.RADAR}
    ];
  }

  getQuestionGraphTypeforMulti() {
    return [
      {text: 'Bar Plot', id: QuestionGraphType.BAR},
      {text: 'Bar Plot Horizontal', id: QuestionGraphType.BAR_HORIZONTAL},
      {text: 'Pie Plot', id: QuestionGraphType.PIE}
    ];
  }

  getQuestionGraphTypeForOrder() {
    return [{text: 'Bar Plot', id: QuestionGraphType.BAR}];
  }

  /**
   * Values for questions graph types select
   * @returns {[{text: string; id: QuestionGraphType} , {text: string; id: QuestionGraphType}]}
   */
  getDefaultQuestionGraphType() {
    return [
      {text: 'Bar Plot', id: QuestionGraphType.BAR},
      {text: 'Pie Plot', id: QuestionGraphType.PIE},
    ];
  }


  getFieldUnicueCloneCount(field: string, fieldValue: string) {
    return this.http.get('api/question/get-field-unique-clone-count?field=' + field + '&fieldValue=' + fieldValue)
      .pipe(catchError(handleError));
  }

  create(question: Question): Observable<Question> {
    return this.http.post<Question>('/api/question', question);
  }

  edit(question: Question): Observable<void> {
    return this.http.put<void>('/api/question', question);
  }

  delete(ids: string): Observable<void> {
    return this.http.delete<void>('/api/question/' + ids);
  }

  getAnswersCategory(): Observable<QuestionsCategories[]> {
    return this.http.get<QuestionsCategories[]>('/api/questions-categories');
  }

  /**
   * Sets question's 'deleted' value to 0.
   * @param id (number: Question id)
   */
  restore(id: number): Observable<any> {
    return this.http.patch<any>('/api/question/restore', {id: id});
  }

  /**
   * Delete question from DB permanently
   * @param id (number)
   */
  deletePermanently(id: number): Observable<void> {
    return this.http.delete<void>('/api/question-permanently/' + id);
  }

  /**
   * POST: checks if title is in use
   * @param title (Question title)
   */
  isTitleValid(title: String): Observable<boolean> {
    return this.http.post<boolean>('/api/question/title-valid', {title: title});
  }
}
