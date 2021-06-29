import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  QuestionGroup
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class QuestionGroupService {

  constructor(private http: HttpClient) { }

  getByQuestionnaireId(id: number): Observable<QuestionGroup[]> {
    return this.http.get<QuestionGroup[]>('/api/question-group/' + id);
  }

  create(group: QuestionGroup): Observable<void | string> {
    return this.http.post<void | string>('/api/question-group', group);
  }

  update(group: QuestionGroup): Observable<void | string> {
    return this.http.patch<void | string>('/api/question-group', group);
  }

  delete(ids: number[]): Observable<void | string> {
    return this.http.delete<void | string>('/api/question-group/' + ids);
  }

  moveToGroup(data: any): Observable<any> {
    return this.http.patch<any>('/api/question-group/move-to-group', data);
  }

  moveToItem(data: any): Observable<any> {
    return this.http.patch<any>('/api/question-group/move-to-item', data);
  }

  sortGroup(data: any): Observable<any> {
    return this.http.patch<any>('/api/question-group/sort-group', data);
  }

  deleteMaps(data: any): Observable<any> {
    return this.http.patch<any>('/api/question-group/maps-delete', data);
  }
}
