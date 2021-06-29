import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { handleError } from '@app/services/error-handler';
import { User, Keys, Questionnaire, SendEmailTemplate,
  Attempt, UserAnswer, UserAnswerOption, ResultReport } from '@app/models';
import { getSessionId } from '@app/utils';

/**
 * Service class to get/post/put User's attempt api.
 * Authentication (NO) ignoring interceptor
 */
@Injectable()
export class AttemptService {
  private http: HttpClient;
  private httpHeaders = new HttpHeaders()
                         .set('If-Modified-Since', 'Mon, 26 Jul 1997 05:00:00 GMT')
                         .set('Cache-Control', 'no-cache')
                         .set('Pragma', 'no-cache')
                         .set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
  constructor(
    private handler: HttpBackend) {
    // To ignore interceptor
    this.http = new HttpClient(this.handler);
  }

  getAttemptById(id: number): Observable<Attempt> {
    return this.http.get<Attempt>('/api/attempt/' + id, { headers: this.httpHeaders })
            .pipe( catchError(handleError) );
  }
  /**
   * POST: creates new user's attempt
   */
  createAttempt(attempt: Attempt): Observable<Attempt> {
    attempt['sessionId'] = getSessionId();
    return this.http.post<Attempt>('/api/attempt', attempt)
            .pipe( catchError(handleError) );
  }

  /**
   * Sets attempt's status to completed.
   * If in questionnaire settings added auto emails:
   *  -Sends Confirmation email of completed questionnaire to user,
   *  -Sends Confirmation email of completed questionnaire by user to admin.
   * @param data ({aId: attempt id, uId: user id, qId: questionnaire id, kId: key id, passed_time: passed time, isAdmin: boolean})
   */
  completeAttempt(data: any): Observable<void | string> {
    data['sessionId'] = getSessionId();
    return this.http.post<void | string>('/api/attempt/complete', data)
            .pipe( catchError(handleError) );
  }

  /**
   * Sets attempt's status to completed.
   * If in questionnaire settings added auto emails:
   *  -Sends Confirmation email of completed questionnaire to user,
   *  -Sends Confirmation email of completed questionnaire by user to admin.
   * @param data ({aId: attempt id, uId: user id, qId: questionnaire id, kId: key id, passed_time: passed time})
   */
  completeAttemptSendRes(data: any): Observable<any> {
    data['sessionId'] = getSessionId();
    return this.http.post<any>('/api/email-templates/complete-send-result', data)
            .pipe( catchError(handleError) );
  }

  /**
   * Returns User if correct secret key (for change user's key) is passed
   * Or null
   * @param uId (User id)
   * @param kId (Key id)
   * @param sKey (secret key)
   */
  getUserIncludesInCompany(uId: number, kId: number, sKey?: string): Observable<User> {
    let params = new HttpParams();
    params = params.append('uId', uId.toString());
    params = params.append('kId', kId.toString());
    params = params.append('sKey', sKey);
    return this.http.get<User>('/api/user-company-include', { params: params })
            .pipe( catchError(handleError) );
  }

  /**
   * Returns User by id,
   * include UsersQuestionnaireAttemptLimit and attempts (include answers with answer_options),
   * include Company ('id') to identify if user belongs to chosen key (if not method will return null)
   * @param uId (User id)
   * @param kId (Key id)
   * @param qId (Questionnaire id)
   */
  getUserAttempts(uId: number, kId: number, qId: number): Observable<User> {
    let params = new HttpParams();
    params = params.append('uId', uId.toString());
    params = params.append('kId', kId.toString());
    params = params.append('qId', qId.toString());
    return this.http.get<User>('/api/user/attempts', { headers: this.httpHeaders, params: params })
            .pipe( catchError(handleError) );
  }

  /**
   * GET: Gets Keys object (with 'id' attribute) || null
   * @param code (Company's code)
   */
  getCompanyIdByCode(code: string): Observable<Keys> {
    return this.http.get<Keys>('/api/company/get-id/' + code)
            .pipe( catchError(handleError) );
  }

  /**
   * Gets Questionnaire ['title' field] including all groups
   * Each group contains Group data with 'group_questions_map' array (with active questions only)
   * @param id (Questionnaire id)
   */
  getGroupsByQuestionnaireId(id: number): Observable<Questionnaire> {
    return this.http.get<Questionnaire>('/api/question-group/full/' + id)
            .pipe( catchError(handleError) );
  }

  /**
   * Sends on server all needed data to send emails to user.
   * @param template (Selected template (required fields: 'email_subject', 'tpl_content'))
   * @param userId (User id)
   * @param key (selected Key)
   * @param questionnaire (selected Questionnaire)
   * @param path (path needed to configure url ('auth' for users invitation emails))
   * @param toAdminSubject (Subject of email that wiil be send to admin, e.g. in 'Change key email' case)
   */
  sendEmails(
    template: SendEmailTemplate,
    userId: number,
    key: Keys,
    questionnaire: Questionnaire,
    path: string,
    toAdminSubject?: string): Observable<number> {
    const data = {
      userId: userId,
      key: key,
      template: template,
      questionnaire: questionnaire,
      path: path,
      toAdminSubject: toAdminSubject
    };
    data['sessionId'] = getSessionId();
    return this.http.post<number>('/api/email-templates/user/send', data)
            .pipe( catchError(handleError) );
  }

  /**
   * Sends on server all needed data to send timeout email to user.
   * @param userId (User id)
   * @param key (selected Key)
   * @param questionnaire (selected Questionnaire)
   */
  sendTimeoutEmail(userId: number, key: Keys, questionnaire: Questionnaire):
   Observable<number> {
    const data = {
      userId: userId,
      key: key,
      questionnaire: questionnaire
    };
    data['sessionId'] = getSessionId();
    return this.http.post<number>('/api/email-templates/user/send-timeout', data)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: Returns (found or created) user answer
   */
  findOrcreateUserAnswer(answer: UserAnswer): Observable<void | UserAnswer> {
    answer['sessionId'] = getSessionId();
    return this.http.post<void | UserAnswer>('/api/user/answer/find-or-create', answer)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: Returns created user answer
   */
  createUserAnswer(answer: UserAnswer): Observable<void | UserAnswer> {
    answer['sessionId'] = getSessionId();
    return this.http.post<void | UserAnswer>('/api/user/answer', answer)
            .pipe( catchError(handleError) );
  }

  /**
   * PATCH: updates user's answer by id
   */
  updateUserAnswer(answer: UserAnswer): Observable<void | UserAnswer> {
    answer['sessionId'] = getSessionId();
    return this.http.post<void | UserAnswer>('/api/user/answer-update', answer)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: Creates, updates or deletes user's answer options
   * CREATE: if data item doesn't contain 'id'
   * UPDATE: if data item contains 'id'
   * DELETE: All items from delete_ids array
   * Passed params:
   * 'data' - required (UserAnswerOption[])
   * 'delete_ids' - required (number[])
   */
  createOrUpdateUserAnswerOptions(opts: UserAnswerOption[], delete_ids: number[]): Observable<void | string> {
    const options = {};
    options['sessionId'] = getSessionId();
    options['data'] = opts;
    options['delete_ids'] = delete_ids;
    return this.http.post<void | string>('/api/user/answer-option', options)
            .pipe( catchError(handleError) );
  }

  /**
   * GET: Get Results report by unique code
   * @param code (string)
   */
  getResultsReportByCode(code: string): Observable<ResultReport> {
    return this.http.get<ResultReport>('/api/results-report/bycode/' + code)
            .pipe( catchError(handleError) );
  }
}
