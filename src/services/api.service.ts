import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get(url: any) {
    return this.http.get<any>(`${environment.serverBaseUrl}${url}`);
  }

  post(url: any, data: any) {
    return this.http.post<any>(`${environment.serverBaseUrl}${url}`, data);
  }

  patch(url: any, data: any) {
    return this.http.patch<any>(`${environment.serverBaseUrl}${url}`, data);
  }

  delete(url: any) {
    return this.http.delete<any>(`${environment.serverBaseUrl}${url}`);
  }
}
