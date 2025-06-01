import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';
import { BillService } from '../../../services/bill.service';
import { TableService } from '../../../services/table.service';
import { GenderService } from '../../../services/gender.service';
import { AgerangeService } from '../../../services/agerange.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bill',
  imports: [CommonModule, FormsModule],
  templateUrl: './bill.component.html',
})
export class BillComponent implements OnInit {
  @ViewChild('billForm') billForm!: NgForm;
  bill: any = {};
  tables: any[] = [];
  genders: any[] = [];
  ageRanges: any[] = [];
  genderEntries: any[] = [];
  ageRangeEntries: any[] = [];
  showModal: boolean = false;
  selectedTable: any = null;

  constructor(
    private reservationService: ReservationService,
    private billService: BillService,
    private tableService: TableService,
    private genderService: GenderService,
    private ageRangeService: AgerangeService
  ) {}

  ngOnInit(): void {
    this.tableService.getTables().subscribe((data) => {
      this.tables = data.map((table: any) => ({
        ...table,
        isAvailable: table.status_name === 'Available', // กำหนดว่าโต๊ะว่างเมื่อ status_name เป็น "Available"
      }));
    });
    this.getGenders();
    this.getAgeRanges();
  }

  getGenders(): void {
    this.genderService.getGenders().subscribe((data) => {
      this.genders = data;
      if (this.genders.length > 0 && this.genderEntries.length === 0) {
        this.addGenderEntry();
      }
    });
  }

  getAgeRanges(): void {
    this.ageRangeService.getAgeranges().subscribe((data) => {
      this.ageRanges = data;
      if (this.ageRanges.length > 0 && this.ageRangeEntries.length === 0) {
        this.addAgeRangeEntry();
      }
    });
  }

  openBillModal(table: any): void {
    if (!table.isAvailable) {
      Swal.fire('Error', `Table ${table.name} is not available.`, 'error');
      return;
    }
    if (this.genders.length === 0 || this.ageRanges.length === 0) {
      Swal.fire('Loading', 'Please wait while loading data...', 'info');
      return;
    }
    this.selectedTable = table;
    this.bill.table_id = table.id;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.bill = {};
    this.selectedTable = null;
    this.genderEntries = this.genders.length > 0 ? [{ selectedGender: this.genders[0], selectedGenderAmount: 1 }] : [];
    this.ageRangeEntries = this.ageRanges.length > 0 ? [{ selectedAgeRange: this.ageRanges[0], selectedAgeRangeAmount: 1 }] : [];
  }

  addBill(): void {
    if (this.billForm.invalid) {
      Object.keys(this.billForm.controls).forEach((field) => {
        const control = this.billForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      Swal.fire('Error', 'Please fill in all required fields.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('bill[bill_status_id]', '2'); // สมมติค่าเริ่มต้น
    formData.append('bill[customer_name]', this.bill.customer_name);
    formData.append('bill[table_id]', this.bill.table_id.toString());

    this.genderEntries.forEach((entry, index) => {
      formData.append(`bill[gender_bills_attributes][${index}][gender_id]`, entry.selectedGender.id.toString());
      formData.append(`bill[gender_bills_attributes][${index}][amount]`, entry.selectedGenderAmount.toString());
    });

    this.ageRangeEntries.forEach((entry, index) => {
      formData.append(`bill[age_range_bills_attributes][${index}][age_range_id]`, entry.selectedAgeRange.id.toString());
      formData.append(`bill[age_range_bills_attributes][${index}][amount]`, entry.selectedAgeRangeAmount.toString());
    });

    this.billService.addBill(formData).subscribe(
      () => {
        this.closeModal();
        Swal.fire('Success', 'Bill created successfully!', 'success');
        // อัปเดตสถานะโต๊ะหลังสร้างบิล
        this.tableService.getTables().subscribe((data) => {
          this.tables = data.map((table: any) => ({
            ...table,
            isAvailable: table.status_name === 'Available',
          }));
        });
      },
      (error: HttpErrorResponse) => {
        Swal.fire('Error', `Failed to create bill: ${error.message}`, 'error');
        console.error('Error adding bill:', error);
      }
    );
  }

  addGenderEntry(): void {
    if (this.genders.length > 0) {
      this.genderEntries.push({
        selectedGender: this.genders[0],
        selectedGenderAmount: 1,
      });
    }
  }

  addAgeRangeEntry(): void {
    if (this.ageRanges.length > 0) {
      this.ageRangeEntries.push({
        selectedAgeRange: this.ageRanges[0],
        selectedAgeRangeAmount: 1,
      });
    }
  }

  removeGenderEntry(index: number): void {
    if (this.genderEntries.length > 1) {
      this.genderEntries.splice(index, 1);
    }
  }

  removeAgeRangeEntry(index: number): void {
    if (this.ageRangeEntries.length > 1) {
      this.ageRangeEntries.splice(index, 1);
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150?text=No+Image';
  }
}