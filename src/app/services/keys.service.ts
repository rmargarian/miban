import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {handleError} from './error-handler';
import {Keys} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class KeysService {

  private httpHeaders = new HttpHeaders()
  .set('Cache-Control', 'no-cache')
  .set('Pragma', 'no-cache')
  .set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');

  constructor(private http: HttpClient, private auth: AuthenticationService) {
  }

  /**
   * GET: gets Questionnaires include Companies by company id
   * @queryParam daysLimit (number) - filter by created date
   * @queryParam fields (Array<string>) - restrict to get only certain fields, example - fields=["id", "name"]
   */
  public getAllKeys(daysLimit?: number): Observable<any[]> {
    if (daysLimit) {
      return this.http.get(`/api/company/get-all?daysLimit=270`, { headers: this.httpHeaders})
        .pipe(
          map((data: any[]) => {
            return data;
          }),
          catchError(handleError));
    }
    if (!daysLimit) {
      return this.http.get(`/api/company/get-all`, { headers: this.httpHeaders})
        .pipe(
          map((data: any[]) => {
            return data;
          }),
          catchError(handleError));
    }
  }

  /**
   * Create new key
   * @param key
   * @returns {Observable<any>}
   */
  public create(key: any): Observable<any> {
    return this.http.post(`/api/company`, key)
      .pipe(catchError(handleError));
  }

  /**
   * Delete a key
   * @param {number} keyId
   * @returns {Observable<any>}
   */
  public delete(keyId: number): Observable<any> {
    return this.http.delete<any>(`/api/company/` + keyId)
      .pipe(catchError(handleError));
  }

  /**
   * Update an existing key
   * @param key
   * @returns {Observable<any>}
   */
  public update(key: any): Observable<any> {
    return this.http.patch<any>(`/api/company/`, key)
      .pipe(catchError(handleError));
  }

  /**
   * Get data to export best negotiators
   * @param {number} companyId
   * @param {number[]} userIds
   * @returns {Observable<any>}
   */
  public exportBestNegotiators(companyId: number, userIds?: number[]): Observable<any> {
    let query = `/api/company/export-best-negotiators/` + companyId;
    if (userIds) {
      query += '?userIds=' + userIds;
    }
    return this.http.get(query, { headers: this.httpHeaders})
      .pipe(catchError(handleError));
  }

  /**
   * Export data to use in participants responses export
   * @param {number} companyId
   * @param {number} questinnaireId
   * @param {number[]} userIds
   * @returns {Observable<any | any>}
   */
  public exportParticipantsResponses(companyId: number, questinnaireId: number, userIds?: number[]) {
    let query = `/api/company/export-participants-responses/` + companyId + `/` + questinnaireId;
    if (userIds) {
      query += '?userIds=' + userIds;
    }
    return this.http.get(query, { headers: this.httpHeaders}).pipe(catchError(handleError));
  }

  /**
   * Get new unique clone counter to use in clone key function
   * @param {string} field
   * @param {string} fieldValue
   * @returns {Observable<any | any>}
   */
  public getFieldUniqueCloneCount(field: string, fieldValue: string) {
    return this.http.get(`api/company/get-field-unique-clone-count?field=` + field + `&fieldValue=` + fieldValue,
    { headers: this.httpHeaders})
      .pipe(catchError(handleError));
  }


  getSortedByActivity(id: Number): Observable<Keys[]> {
    return this.http.get<Keys[]>('/api/company/sorted-by-activity/' + id, { headers: this.httpHeaders});
  }

  activateQuestionnaire(data: any): Observable<any> {
    return this.http.patch<any>(`/api/company/activate-questionnaire/`, data)
      .pipe(catchError(handleError));
  }
}


