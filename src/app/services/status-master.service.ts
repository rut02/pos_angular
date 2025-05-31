import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
private apiUrl = `${environment.apiUrl}status_masters`
  constructor(
    private http:HttpClient
  ) { }
  getStatuses(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
