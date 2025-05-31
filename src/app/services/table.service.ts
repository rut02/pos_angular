import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(private http: HttpClient) { }

  getTables(): Observable<any> {
    return this.http.get(`${environment.apiUrl}tables`);
  }
  getAvaliableTables(): Observable<any> {
    return this.http.get(`${environment.apiUrl}get_available_tables`);
  }
  addTable(fromData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}tables`, fromData);
  }
  updateTable(tableId: number, fromData: FormData): Observable<any> {
    return this.http.put(`${environment.apiUrl}tables/${tableId}`, fromData);
  }
  deleteTable(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}tables/${id}`);
  }
}
