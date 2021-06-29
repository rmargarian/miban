import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

import {
  User,
  UserQuestionnaireContact,
  Attempt,
  UserQuestionnaireAttemptsLimit
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private auth: AuthenticationService) {
  }

  /**
   * GET: gets users list from database by company id
   * @param id (Company id)
   */
  getAllUsersByCompany(id: Number, emailsNotEmpty?: boolean): Observable<User[]> {
    const qParams = emailsNotEmpty ? '?emailsNotEmpty=true' : '';
    return this.http.get<User[]>('/api/users/' + id + qParams);
  }

  /**
   * DELETE: delete users from database by id
   * @param user_ids
   */
  deleteUsersById(ids: Number[]): Observable<void | String> {
    return this.http.delete<void | String>('/api/user/' + ids);
  }

  /**
   * GET: gets user answers by attempt id
   * @param id (Attempt id)
   */
  getAnswersByAttemptId(id: Number): Observable<any> {
    return this.http.get<any>('/api/user/answers/' + id);
  }

  /**
   * PATCH: updates users questionnaire contact and stores it to database
   */
  updateUsersQuestionnaireContact(data: any): Observable<void | UserQuestionnaireContact[]> {
    return this.http.patch<void | UserQuestionnaireContact[]>('/api/users/quest-contact', data);
  }

   /**
   * PATCH: updates users questionnaire status, attempts limit and report completion
   */
  updateUsersQuestionnaireAttemptsLimit(data: any): Observable<any> {
    return this.http.patch<any>('/api/users/quest-attempts-limit', data);
  }

  /**
   * GET: gets users attempts limits by user ids
   */
  getAttemptsLimits(user_ids: string): Observable<UserQuestionnaireAttemptsLimit[]> {
    return this.http.get<UserQuestionnaireAttemptsLimit[]>('/api/users/quest-attempts-limit/' + user_ids);
  }
  /**
   * DELETE: delete attempt from database by attempt id
   * @param id (Attempt id)
   */
  deleteAttemptById(id: Number): Observable<void | Attempt> {
    return this.http.delete<void | Attempt>('/api/attempt/' + id);
  }

  /**
   * PATCH: updates users location and date fields and stores it to database
   */
  updateUsersFields(data: any): Observable<void | User[]> {
    return this.http.patch<void | User[]>('/api/users/update-fields', data);
  }

  moveUsers(data: Object): Observable<void> {
    return this.http.patch<void>('/api/users/move', data);
  }

  /**
   * PATCH: creates or updates (if property 'id' is present) users.
   * @param companyId (number: company id in which users will be created)
   */
  importUsers(companyId: number): Observable<void | string> {
    return this.http.patch<void | string>('/api/users/import', {companyId: companyId});
  }

  /**
   * Reads .xls or .xlsx file. Stores each row in array: User[]
   * Finds existing users by emails. If some email already used, sets 'id' property for user.
   * @param data (FormData with chosen file)
   */
  uploadFile(data: FormData): Observable<User[]> {
    return this.http.post<User[]>('/api/users/upload', data);
  }

  /**
   * GET: Returns array of users whose first_name/last_name/email are matches passed value
   * @param value (string)
   */
  getUsersByValue(value: string): Observable<User[]> {
    return this.http.get<User[]>('/api/users/find/' + value);
  }
}
