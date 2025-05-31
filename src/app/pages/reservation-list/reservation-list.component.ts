import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { TableService } from '../../services/table.service';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-reservation-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-list.component.html',
})
export class ReservationListComponent implements OnInit {
  reservations: any[] = [];
  tables: any[] = [];
  showDetailsModal: boolean = false;
  showBillConfirmModal: boolean = false;
  showCancelConfirmModal: boolean = false;
  selectedReservation: any = null;
  bill: any = { table_id: null, customer_name: null };
  staff_id = 1; // สมมติ staff_id สำหรับการสร้างบิล
  genders = [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
    { id: 3, name: 'Other' }
  ];
  ageRanges = [
    { id: 1, name: '0-12' },
    { id: 2, name: '13-18' },
    { id: 3, name: '19-30' },
    { id: 4, name: '31-50' },
    { id: 5, name: '51+' }
  ];
  genderEntries: { selectedGender: any, selectedGenderAmount: number }[] = [{ selectedGender: null, selectedGenderAmount: 1 }];
  ageRangeEntries: { selectedAgeRange: any, selectedAgeRangeAmount: number }[] = [{ selectedAgeRange: null, selectedAgeRangeAmount: 1 }];

  constructor(
    private reservationService: ReservationService,
    private tableService: TableService,
    private billService: BillService
  ) {}

  ngOnInit(): void {
    // ดึงข้อมูลการจอง
    this.reservationService.getReservedReservations().subscribe((data) => {
      this.reservations = data;
    });

    // ดึงข้อมูลโต๊ะ
    this.tableService.getAvaliableTables().subscribe((data) => {
      this.tables = data;
    });
  }

  openDetailsModal(reservation: any): void {
    this.selectedReservation = reservation;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedReservation = null;
  }

  openBillConfirmModal(reservation: any): void {
    this.selectedReservation = reservation;
    this.bill.table_id = reservation.table_id;
    this.bill.customer_name = reservation.customer_name;
    this.genderEntries = [{ selectedGender: null, selectedGenderAmount: 1 }];
    this.ageRangeEntries = [{ selectedAgeRange: null, selectedAgeRangeAmount: 1 }];
    this.showBillConfirmModal = true;
  }

  closeBillConfirmModal(): void {
    this.showBillConfirmModal = false;
    this.bill = { table_id: null, customer_name: null };
    this.selectedReservation = null;
    this.genderEntries = [{ selectedGender: null, selectedGenderAmount: 1 }];
    this.ageRangeEntries = [{ selectedAgeRange: null, selectedAgeRangeAmount: 1 }];
  }

  openCancelConfirmModal(reservation: any): void {
    this.selectedReservation = reservation;
    this.showCancelConfirmModal = true;
  }

  closeCancelConfirmModal(): void {
    this.showCancelConfirmModal = false;
    this.selectedReservation = null;
  }

  addGenderEntry(): void {
    this.genderEntries.push({ selectedGender: null, selectedGenderAmount: 1 });
  }

  removeGenderEntry(index: number): void {
    this.genderEntries.splice(index, 1);
  }

  addAgeRangeEntry(): void {
    this.ageRangeEntries.push({ selectedAgeRange: null, selectedAgeRangeAmount: 1 });
  }

  removeAgeRangeEntry(index: number): void {
    this.ageRangeEntries.splice(index, 1);
  }

  confirmBill(): void {
    if (!this.genderEntries.every(e => e.selectedGender && e.selectedGenderAmount > 0) ||
        !this.ageRangeEntries.every(e => e.selectedAgeRange && e.selectedAgeRangeAmount > 0)) {
      alert('Please fill in all gender and age fields.');
      return;
    }

    const formData = new FormData();
    formData.append('bill[table_id]', this.bill.table_id);
    formData.append('bill[customer_name]', this.bill.customer_name);
    formData.append('bill[reservation_id]', this.selectedReservation.id);
    formData.append('bill[staff_id]', this.staff_id.toString());
    formData.append('bill[genders]', JSON.stringify(this.genderEntries.map(entry => ({
      gender: entry.selectedGender?.name,
      amount: entry.selectedGenderAmount
    }))));
    formData.append('bill[age_ranges]', JSON.stringify(this.ageRangeEntries.map(entry => ({
      age_range: entry.selectedAgeRange?.name,
      amount: entry.selectedAgeRangeAmount
    }))));

    this.billService.addBill(formData).subscribe(
      (data) => {
        this.closeBillConfirmModal();
        this.reservationService.getReservedReservations().subscribe((data) => {
          this.reservations = data;
        });
      },
      (error) => {
        console.error('Error creating bill', error);
      }
    );
  }

  cancelReservation(): void {
    // this.reservationService.cancelReservation(this.selectedReservation.id).subscribe(
    //   () => {
    //     this.closeCancelConfirmModal();
    //     // อัปเดตสถานะโต๊ะเป็น Available
    //     this.tableService.updateTableStatus(this.selectedReservation.table_id, 'Available').subscribe(() => {
    //       this.tableService.getAvaliableTables().subscribe((data) => {
    //         this.tables = data;
    //       });
    //     });
    //     // อัปเดตรายการจอง
    //     this.reservationService.getReservedReservations().subscribe((data) => {
    //       this.reservations = data;
    //     });
    //   },
    //   (error) => {
    //     console.error('Error cancelling reservation', error);
    //   }
    // );
  }
}