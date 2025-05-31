
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}products`

  constructor(
    private http:HttpClient,
  ) { }

  getProducts(): Observable<any>{
    return this.http.get(this.apiUrl);
  }

  addProduct(fromData: FormData): Observable<any>{
    return this.http.post(this.apiUrl,fromData);
  }

  updateProduct(productId: number,fromData: FormData): Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/${productId}`,fromData);
  }

  deleteProduct(id: number): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}