import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = `${environment.apiUrl}bills`;

  constructor(
    private http:HttpClient
  ) { }

  getBills(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  addBill(fromData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, fromData);
  }
  updateBill(billId: number,data:{bill:any} ): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${billId}`, data);
  
  }
  deleteBill(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
