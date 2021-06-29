import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Questionnaire, SendEmailTemplate, Keys, IncompleteAttempt } from '@app/models';
import { QuestionnairesByType } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class QuestionnairesService {

  private httpHeaders = new HttpHeaders()
                         .set('Cache-Control', 'no-cache')
                         .set('Pragma', 'no-cache')
                         .set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
  constructor(private http: HttpClient) { }

  /**
   * Get a list of all questionnaires
   * @param {string} fields
   * @returns {Observable<Questionnaire[]>}
   */
  getAllQuestionnaires(fields?: string): Observable<Questionnaire[]> {
    const req_fields = fields ? '?fields=' + fields : '';
    return this.http.get<Questionnaire[]>(`/api/quest/get-all${req_fields}`, { headers: this.httpHeaders});
  }

  /**
   * Get a list of the completed questionnaires
   * @param {string[]} ids
   * @param {number[]} company_ids
   * @returns {Observable<Questionnaire[]>}
   */
  getCompletedQuestionnaires(ids: number[], company_ids: number[]): Observable<Questionnaire[]> {
    const query_ids = '?company_ids=' + company_ids + '&usersIds=' + ids;
    return this.http.get<Questionnaire[]>(`/api/quest/get-completed-questionnaires${query_ids}`, { headers: this.httpHeaders});
  }


  /**
   * Split questionnaires by their type to show in different sections on the view
   * @param {Questionnaire[]} questionnaires
   * @returns {QuestionnairesByType}
   */
  public splitQuestionnairesByType(questionnaires: Questionnaire[]): QuestionnairesByType {
    const splitedQuestionnaires = {profiles: [], assessments: [], feedbacks: []};
    questionnaires.forEach(questionnaire => {
      switch (questionnaire.type) {
        case 1:
          splitedQuestionnaires.assessments.push(questionnaire);
          break;
        case 2:
          splitedQuestionnaires.profiles.push(questionnaire);
          break;
        case 3:
          splitedQuestionnaires.feedbacks.push(questionnaire);
          break;
      }
    });
    return splitedQuestionnaires;
  }

  /**
   * GET: gets Questionnaires include Companies by company id
   * @param id (Company id)
   */
  getQuestsByCompany(id: Number): Observable<any> {
    return this.http.get<any>('/api/quest-by-company/' + id, { headers: this.httpHeaders});
  }

  /**
   * Creates new Questionnaire
   * @param {Questionnaire} quest
   * @returns {Observable<void | Questionnaire>}
   */
  createQuestionnaire(quest: Questionnaire): Observable<void | Questionnaire> {
    return this.http.post<void | Questionnaire>('/api/quest', quest);
  }

  /**
   * Update an existing Questionnaire
   * @param {Questionnaire} quest
   * @returns {Observable<void | Questionnaire>}
   */
  updateQuestionnaire(quest: Questionnaire): Observable<void | Questionnaire> {
    return this.http.patch<void | Questionnaire>('/api/quest', quest);
  }

  /**
   * Delete a Questionnaire
   * @param {number} id
   * @returns {Observable<void | Questionnaire>}
   */
  deleteQuestionnaire(id: number): Observable<void | Questionnaire> {
    return this.http.delete<void | Questionnaire>('/api/quest/' + id);
  }

  /**
   * Clone an existing a Questionnaire
   * @param data
   * @returns {Observable<number>}
   */
  cloneQuestionnaire(data: any): Observable<number> {
    return this.http.patch<number>('/api/quest/clone', data);
  }

  getTemplatesByQuestId(id: number): Observable<any> {
    return this.http.get<any>('/api/email-templates/' + id, { headers: this.httpHeaders});
  }

  createTemplate(template: SendEmailTemplate[]): Observable<SendEmailTemplate> {
    return this.http.post<SendEmailTemplate>('/api/email-templates', template);
  }

  updateTemplates(templates: SendEmailTemplate[]): Observable<void | string> {
    return this.http.patch<void | string>('/api/email-templates', templates);
  }

  deleteTemplate(id: number): Observable<void | string> {
    return this.http.delete<void | string>('/api/email-templates/' + id);
  }

  copyTemplates(templatesIds: any): Observable<number> {
    return this.http.post<number>('/api/email-templates/copy', templatesIds);
  }

  /**
   * Sends on server all needed data to send emails to users.
   * @param template (Selected template (required fields: 'email_subject', 'tpl_content'))
   * @param userIds (String with registred users ids separated by spaces)
   * @param key (selected Key)
   * @param questionnaire (selected Questionnaire)
   * @param path (path needed to configure url ('auth' for users invitation emails))
   * @param enteredEmails (string with entered emails, separeted by spaces,commas or semi-colons)
   */
  sendEmails(
    template: SendEmailTemplate,
    userIds: string,
    key: Keys,
    questionnaire: Questionnaire,
    path: string,
    enteredEmails?: string): Observable<number> {
    let emails = [];
    if (enteredEmails) {
      emails = enteredEmails.replace(/\s/g, ',').replace(';', ',').split(',');
      emails = emails.filter(item => item !== '');
    }
    const data = {
      userIds: userIds,
      emails: emails,
      key: key,
      template: template,
      questionnaire: questionnaire,
      path: path
    };

    return this.http.post<number>('/api/email-templates/send', data);
  }

  /**
   * Sends on server all needed data to send Result emails to users.
   * @param template (Selected template (required fields: 'email_subject', 'tpl_content'))
   * @param userIds (String with registred users ids separated by spaces)
   * @param key (selected Key)
   * @param questionnaire (selected Questionnaire)
   */
  sendResultEmails(
    template: SendEmailTemplate,
    userIds: string,
    key: Keys,
    questionnaire: Questionnaire): Observable<number> {
    const data = {
      userIds: userIds,
      key: key,
      template: template,
      questionnaire: questionnaire
    };

    return this.http.post<number>('/api/email-templates/send-result', data);
  }

  /**
   * POST: checks if acronym is in use
   * @param acronym (Questionnaire acronym)
   */
  isAcronymValid(acronym: String): Observable<boolean> {
    return this.http.post<boolean>('/api/quest/acronym-valid', {acronym: acronym});
  }


  /**
   * Get all incomplete attempts by Questionnaire id
   * @param q_id (number)
   */
  getAllIncompleteAttemptsByQId(qId: number): Observable<IncompleteAttempt[]> {
    return this.http.get<any>('/api/incomplete-attempt/get-by-qid/' + qId, { headers: this.httpHeaders});
  }

}

