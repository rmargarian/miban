import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/index';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { handleError } from '@app/services/error-handler';
import { catchError } from 'rxjs/operators';
import { Keys, Report, User } from '@app/models';
import { getSessionId } from '@app/utils';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private httpSession: HttpClient;

  constructor(
    private http: HttpClient,
    private handler: HttpBackend) {
      // To ignore interceptor
    this.httpSession = new HttpClient(this.handler);
  }

  /**
   * Get report by unique code string
   * @param {string} code
   * @returns {Observable<any>}
   */
  public getByCode(code: string): Observable<any> {
    const sessionParam = `?sessionId=${getSessionId()}`;
    return this.httpSession.get<any>('/api/clients/' + code + sessionParam);
  }

  public getReportsByCompanyId(companyId: string): Observable<Report[]> {
    return this.http.get<Report[]>('/api/clients/by-company-id/' + companyId);
  }

  public renameReport(newName: string, id: number): Observable<void> {
    return this.http.post<void>('/api/clients/rename', {name: newName, id: id});
  }

  public deleteReport(id: number): Observable<void> {
    return this.http.delete<void>('/api/clients/' + id)
      .pipe(catchError(handleError));
  }

  /**
   * Deletes report by code
   * @param code (Report code)
   */
  public deleteReportByCode(code: string): Observable<void> {
    return this.http.delete<void>('/api/clients/delete-by-code/' + code)
      .pipe(catchError(handleError));
  }

  public getCompaniesByQuestId(id: number): Observable<Keys[]> {
    return this.http.get<Keys[]>('/api/clients/get-companies/' + id);
  }

  public getAllKeysByQuestId(id: number): Observable<Keys[]> {
    return this.http.get<Keys[]>('/api/clients/get-all-companies/' + id);
  }

  public getUsersByKeysAndQuestionnaire(selectedCompaniesIds: number[], questionnaireId: number): Observable<User[]> {
    const companiesIds = selectedCompaniesIds.toString();
    return this.http.get<User[]>('/api/clients/get-users-by-keys?companiesIds=' + companiesIds + '&questionnaireId=' + questionnaireId);
  }

  public generateReport(companyIds: number[], userIds: number[], questionnaireId: number): Observable<any> {
    return this.http.get<any>('/api/clients/generate-report?companyIds=' + companyIds +
      '&userIds=' + userIds + '&questId=' + questionnaireId);
  }

  public createReport(companyId: number[], questionnaireId: number, name: string, html: string): Observable<any> {
    const reportInfo = {
      cid: companyId,
      qid: questionnaireId,
      name: name,
      html: html
    };
    return this.http.post<any>('/api/clients/create-report', reportInfo);
  }

  public sendEmailReport(reportHtml, images, emails, subject): Observable<any> {
    return this.http.post('/api/clients/report-email', {
      images: images,
      reportTemplate: reportHtml,
      emails: emails,
      subject: subject
    });
  }

  /**
   * Get generated PDF buffer
   * @param code (Reports's code)
   */
  generatePdf(code: string, pfa_name: string): Observable<any> {
    return this.http.get('/api/clients/generate-pdf/' + code + '/' + pfa_name, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/pdf'
      }
    });
  }
}
