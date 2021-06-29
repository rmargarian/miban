import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { Admin } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient, private auth: AuthenticationService) {
  }

  public getAll(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`/api/admin/get-all`);
  }

  public register(user: any): Observable<Admin> {
    return this.http.post<Admin>(`/api/admin/register`, user)
  }

  public update(admin: Admin): Observable<Admin> {
    return this.http.patch<Admin>(`/api/admin/update`, admin);
  }

  public delete(adminId: number): Observable<Admin> {
    return this.http.delete<Admin>(`/api/admin/delete/` + adminId);
  }

  public getAdminById(adminId: number): Observable<Admin> {
    return this.http.get<Admin>(`/api/admin/` + adminId);
  }
}
