import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {
  private apiUrl = `${environment.apiUrl}product_categories`;

  constructor(
    private http:HttpClient
  ) { }

getCategories(): Observable<any>{
  return this.http.get(this.apiUrl);  
}
addCategory(name:any): Observable<any>{
  return this.http.post(this.apiUrl,name);
}
}
