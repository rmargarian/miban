import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { handleError } from '@app/services/error-handler';
import { getSessionId } from '@app/utils';

import {
  TrainingCourse,
  User,
  Keys,
  Attempt,
  SharedModel
} from '@app/models';

/**
 * Service class to get/post/put shared (used by admin and user) api.
 * Authentication (for POST requests) by 'sessionId', ignoring interceptor
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {

  private http: HttpClient;
  private user_url: string = '';

  constructor(private handler: HttpBackend) {
    // To ignore interceptor
    this.http = new HttpClient(this.handler);

    this.retrieveUserUrl().subscribe((url: string) => {
        this.user_url = url;
      }, (err) => {
      });
  }

  /**
   * Needed to ping server is started.
   */
  ping(): Observable<any> {
    return this.http.get<any>('/api/ping')
            .pipe( catchError(handleError) );
  }

  getUserUrl() { return this.user_url; }

  /**
   * GET: gets CareerCategory, Country, Currency, State lists
   */
  getAllShared(): Observable<SharedModel> {
    return this.http.get<SharedModel>('/api/shared').pipe( catchError(handleError) );
  }

  getAllTrainingCourses(): Observable<TrainingCourse[]> {
    return this.http.get<TrainingCourse[]>('/api/training-courses')
            .pipe( catchError(handleError) );
  }

  /**
   * GET: checks if email is in use
   * @param email (User email)
   */
  isUserEmailValid(email: String): Observable<boolean> {
    return this.http.get<boolean>('/api/user/email-valid/' + email)
            .pipe( catchError(handleError) );
  }

  isPasswordValid(data: any): Observable<boolean> {
    data['sessionId'] = getSessionId();
    return this.http.post<boolean>('/api/user/passwd-valid', data)
            .pipe( catchError(handleError) );
  }
/**
 * Checks if user with passed email has taken questionnaire with passed id.
 * If taken returns false - not valid
 * @param email (string)
 * @param qId (number)
 */
  isAttemptValid(email: string, qId: number): Observable<boolean> {
    return this.http.get<boolean>('/api/attempt/taken/' + email + '/' + qId)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: creates new user
   */
  createUser(user: User, updateDate?: boolean): Observable<void | User> {
    user['sessionId'] = getSessionId();
    user['updateDate'] = updateDate;
    return this.http.post<void | User>('/api/user', user)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: finds or creates new user
   */
  findOrCreateUser(user: User): Observable<void | User> {
    user['sessionId'] = getSessionId();
    return this.http.post<void | User>('/api/user/find-or-create', user)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: updates user's data by id and stores it to database
   */
  updateUser(user: User, updateDate?: boolean): Observable<void | User> {
    user['sessionId'] = getSessionId();
    user['updateDate'] = updateDate;
    return this.http.post<void | User>('/api/user-update', user)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: updates user's last logged in IP address
   */
  updateUserIp(user: User): Observable<void | User> {
    user['sessionId'] = getSessionId();
    return this.http.post<void | User>('/api/user/update-ip', user)
            .pipe( catchError(handleError) );
  }

  getCompanyById(companyId: number): Observable<Keys> {
    return this.http.get<Keys>('/api/company/company-by-id/' + companyId)
            .pipe( catchError(handleError) );
  }

  getAllConfigurations(): Observable<any[]> {
    return this.http.get<any[]>('/api/configuration')
            .pipe( catchError(handleError) );
  }

  /**
   * POST: updates user's attempt by id
   */
  updateAttempt(attempt: Attempt): Observable<Attempt> {
    attempt['sessionId'] = getSessionId();
    return this.http.post<Attempt>('/api/attempt-update', attempt)
            .pipe( catchError(handleError) );
  }

  /**
   * Returns user BASE URL
   */
  retrieveUserUrl(): Observable<string> {
    return this.http.get<string>('/api/configuration/user-url')
            .pipe( catchError(handleError) );
  }

  /**
   * Returns array of users found by emails.
   * @param emails (string: emails separated by comma)
   */
  getUsersByEmails(emails: string): Observable<User[]> {
    return this.http.get<User[]>('/api/user/find/' + emails)
            .pipe( catchError(handleError) );
  }

/**
 * @param secret	Required. The shared key between your site and reCAPTCHA.
 * @param response	Required. The user response token provided by the reCAPTCHA client-side integration on your site.
 * @param remoteip	Optional. The user's IP address.
 */
  verifyCaptcha(secret: string, response: string, remoteip?: string): Observable<any> {
    let body = new HttpParams();
    body = body.set('secret', secret);
    body = body.set('response', response);
   // data['sessionId'] = getSessionId();
    return this.http.post<any>('https://www.google.com/recaptcha/api/siteverify', body)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: delete incomplete attempts from database by ids
   * @param user_ids
   */
  deleteIncompleteAttempts(ids: Number[]): Observable<void | String> {
    return this.http.post<void | String>('/api/incomplete-attempt/delete', {ids: ids})
            .pipe( catchError(handleError) );
  }

  /**
   * POST: creates new unsubscribe
   */
  createUnsubscribe(unsub: {email}): Observable<void | {email}> {
    unsub['sessionId'] = getSessionId();
    return this.http.post<void | {email}>('/api/unsubscribe', unsub)
            .pipe( catchError(handleError) );
  }

  /**
   * DELETE: delete unsubscribes from database by ids
   * @param user_ids
   */
  deleteUnsubscribes(ids: Number[]): Observable<void | String> {
    return this.http.delete<void | String>('/api/unsubscribe/' + ids)
            .pipe( catchError(handleError) );
  }

}
