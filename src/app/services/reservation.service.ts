import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
private apiUrl = `${environment.apiUrl}reservations`
  constructor(
    private http:HttpClient
  ) { }

  getReservations(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  getReservedReservations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}get_reserved_reservations`);
  }
  addReservation(fromData: FormData): Observable<any> {
    return this.http.post(this.apiUrl,fromData);
  }
  updateReservation(reservationId: number,fromData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${reservationId}`,fromData);
  }
  deleteReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
