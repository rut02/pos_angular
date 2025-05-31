// reservation.component.ts
// Remains exactly the same as previous version
import { Component, ViewChild } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { TableService } from '../../services/table.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-reservation',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation.component.html',
  // No styleUrl needed since we're using Tailwind classes inline
})
export class ReservationComponent {
  @ViewChild('reservationForm') reservationForm!: NgForm;
  reservation: any = {};
  tables: any[] = [];
  showModal: boolean = false;
  selectedTable: any = null;
  staff = 1;

  constructor(
    private reservationService: ReservationService,
    private tableService: TableService
  ) { }

  ngOnInit(): void {    
    this.tableService.getAvaliableTables().subscribe((data) => {
      this.tables = data;
    });
  }

  openReservationModal(table: any): void {
    this.selectedTable = table;
    this.reservation.table_id = table.id;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.reservation = {};
    this.selectedTable = null;
  }

    addReservation(): void {
    
    if (this.reservationForm.invalid) {
      
      Object.keys(this.reservationForm.controls).forEach(field => {
        const control = this.reservationForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    const formData = new FormData();
    this.reservation.staff_id = this.staff;
    formData.append('reservation[table_id]', this.reservation.table_id);
    formData.append('reservation[customer_name]', this.reservation.customer_name);
    formData.append('reservation[reservation_date]', this.reservation.reservation_date);
    formData.append('reservation[staff_id]', this.reservation.staff_id);

    this.reservationService.addReservation(formData).subscribe(
      (data) => {
        this.closeModal();
      },
      (error) => {
        console.error('Error adding reservation', error);
      }
    );
  }
}