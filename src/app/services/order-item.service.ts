import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderItemService {
 

  private apiUrl = `${environment.apiUrl}order_items`;

constructor(private http: HttpClient) {}
  addOrderItem(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  getOrderItems(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getOrderItemsByOrderId(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/order/${orderId}`);
  }
  getOrderItemByBillId(billId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/bill/${billId}`);
  }

  deleteOrderItem(orderItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${orderItemId}`);
  }
}
