import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}orders`;

constructor(private http: HttpClient) {}

  addOrder(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
  getOrders(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  getOrdersByBillId(billId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/bill/${billId}`);
  }
  updateOrder(orderId: number,order: any ): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}`, order);
  }
  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${orderId}`);
  }
}
