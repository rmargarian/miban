import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrainingCourse } from '@app/models';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { handleError } from './error-handler';

@Injectable({
  providedIn: 'root'
})

export class TrainingCourseService {

  constructor(private http: HttpClient) {
  }

  /**
   * Create new TrainingCourse
   * @param {TrainingCourse} trainingCourse
   * @returns {Observable<TrainingCourse[]>}
   */
  createNewTrainingCourse(trainingCourse: TrainingCourse): Observable<TrainingCourse[]> {
    return this.http.post<TrainingCourse[]>(`/api/training-courses`, trainingCourse);
  }

  /**
   * Delete an existing TrainingCourse
   * @param {number} courseId
   * @param {number} courseOrder
   * @returns {Observable<TrainingCourse>}
   */
  removeTrainingCourse(courseId: number, courseOrder: number): Observable<TrainingCourse> {
    return this.http.delete<TrainingCourse>('/api/training-courses/' + courseId + '/' + courseOrder);
  }

  /**
   * Update an existing TrainingCourse
   * @param data
   * @returns {Observable<void | TrainingCourse[]>}
   */
  update(data): Observable<void | TrainingCourse[]> {
    return this.http.put<TrainingCourse[]>('/api/training-courses', data);
  }

  /**
   * Update selected Training Course name
   * @param data
   * @returns {Observable<any>}
   */
  updateName(data): Observable<any> {
    return this.http.put<any>('/api/training-course/rename', data);
  }

  /**
   * Get new unique clone counter to use in clone training course function
   * @param {string} field
   * @param {string} fieldValue
   * @returns {Observable<any | any>}
   */
  getFieldUniqueCloneCount(field: string, fieldValue: string) {
    return this.http.get(`api/training-courses/get-field-unique-clone-count?field=` + field + `&fieldValue=` + fieldValue)
      .pipe(catchError(handleError));
  }
}
