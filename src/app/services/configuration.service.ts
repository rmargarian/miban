import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private http: HttpClient) { }

  update(data): Observable< void | any> {
    return this.http.put<any[]>('/api/configuration', data);
  }
}
