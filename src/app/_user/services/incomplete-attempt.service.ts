import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { handleError } from '@app/services/error-handler';
import { IncompleteAttempt } from '@app/models';
import { getSessionId } from '@app/utils';

/**
 * Service class to get/post/put Incomplete Attempts attempt api.
 * Authentication (NO) ignoring interceptor
 */
@Injectable()
export class IncompleteAttemptService {
  private http: HttpClient;
  constructor(
    private handler: HttpBackend) {
    // To ignore interceptor
    this.http = new HttpClient(this.handler);
  }

  /**
   * Get incomplete attempt by id
   * @param id (number)
   */
  getById(id: number): Observable<IncompleteAttempt[]> {
    return this.http.get<IncompleteAttempt[]>('/api/incomplete-attempt/' + id)
            .pipe( catchError(handleError) );
  }

  /**
   * POST: creates new incomplete attempt
   * @param attempt (IncompleteAttempt)
   */
  create(attempt: IncompleteAttempt): Observable<IncompleteAttempt> {
    attempt['sessionId'] = getSessionId();
    return this.http.post<IncompleteAttempt>('/api/incomplete-attempt', attempt)
            .pipe( catchError(handleError) );
  }

  /**
   * PATCH: update incomplete attempt
   * @param attempt (IncompleteAttempt)
   */
  update(attempt: IncompleteAttempt): Observable<IncompleteAttempt> {
    attempt['sessionId'] = getSessionId();
    return this.http.post<IncompleteAttempt>('/api/incomplete-attempt/update', attempt)
            .pipe( catchError(handleError) );
  }

}
