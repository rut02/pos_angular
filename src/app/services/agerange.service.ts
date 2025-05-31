import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgerangeService {
private apiUrl = `${environment.apiUrl}age_ranges`
  constructor(
    private http:HttpClient
  ) { }

  getAgeranges(): Observable<any> {
    return this.http.get(`${environment.apiUrl}age_ranges`);
  }

}
