import { Component, ViewChild } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { TableService } from '../../services/table.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-reservation',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation.component.html',
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
  ) {}

  ngOnInit(): void {
    this.tableService.getTables().subscribe((data) => {
      this.tables = data.map((table: any) => ({
        ...table,
        isAvailable: table.status_name === 'Available', // กำหนดว่าโต๊ะว่างเมื่อ status_name เป็น "Available"
      }));
    });
  }

  openReservationModal(table: any): void {
    if (!table.isAvailable) return; // ไม่เปิด Modal ถ้าโต๊ะไม่ว่าง
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
      Object.keys(this.reservationForm.controls).forEach((field) => {
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
        // อัปเดตสถานะโต๊ะหลังจากจองสำเร็จ
        this.tableService.getTables().subscribe((data) => {
          this.tables = data.map((table: any) => ({
            ...table,
            isAvailable: table.status_name === 'Available',
          }));
        });
      },
      (error) => {
        console.error('Error adding reservation', error);
      }
    );
  }
}