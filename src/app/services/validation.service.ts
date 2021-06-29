import {Injectable} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

/**
 * Service to validate field presence in database
 */
export class ValidationService {

  constructor(private http: HttpClient) {
  }

  isAdminEmailValid(email: String): Observable<boolean> {
    return this.http.get<boolean>('/api/admin/email-valid/' + email);
  }

  isAdminUserNameValid(name: String): Observable<boolean> {
    return this.http.get<boolean>('/api/admin/username-valid/' + name);
  }

  isCompanyKeyValid(name: String): Observable<boolean> {
    return this.http.get<boolean>(`/api/company/company-key-valid/` + name);
  }

  isCompanyTitleValid(name: String): Observable<boolean> {
    return this.http.get<boolean>(`/api/company/company-title-valid/` + name);
  }

  isQuestionnaireTemplateValid(params: string): Observable<boolean> {
    return this.http.get<boolean>('/api/email-templates/validate/' + params);
  }

  isTrainingCourseNameValid(name: String): Observable<boolean> {
    return this.http.get<boolean>(`api/training-courses/name-valid/` + name);
  }
}
