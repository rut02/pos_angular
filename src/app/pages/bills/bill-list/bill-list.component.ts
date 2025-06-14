import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BillService } from '../../../services/bill.service';
import { TableService } from '../../../services/table.service';
import { OrderService } from '../../../services/order.service';
import Swal from 'sweetalert2';
import { OrderItemService } from '../../../services/order-item.service';

@Component({
  selector: 'app-bill-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './bill-list.component.html',
})
export class BillListComponent implements OnInit {
  bills: any[] = [];
  filteredBills: any[] = []; // เพิ่มตัวแปรสำหรับบิลที่ถูกกรอง
  tables: any[] = [];
  statuses: { id: number; name: string }[] = []; // เก็บสถานะทั้งหมด
  selectedStatus: string = 'Opened'; // ค่าเริ่มต้นเป็น Opened
  showDetailsModal: boolean = false;
  showCheckBillModal: boolean = false;
  selectedBill: any = null;
  memberNumber: string = '';
  getPaid: number | null = null;
  submitted: boolean = false;

  constructor(
    private billService: BillService,
    private tableService: TableService,
    private router: Router,
    private orderService: OrderService,
    private orderItemService: OrderItemService
  ) {}

  ngOnInit(): void {
    // ดึงข้อมูลโต๊ะ
    this.tableService.getAvaliableTables().subscribe((data) => {
      this.tables = data;
    });

    // ดึงข้อมูลบิล
    this.billService.getBills().subscribe((data) => {
      this.bills = data.map((bill: { genders: string; age_ranges: string }) => ({
        ...bill,
        genders: bill.genders ? JSON.parse(bill.genders) : [],
        age_ranges: bill.age_ranges ? JSON.parse(bill.age_ranges) : [],
      }));

      // ดึงสถานะทั้งหมดจากข้อมูลบิล
      this.statuses = Array.from(
        new Map(
          this.bills.map((bill) => [
            bill.status_master.id,
            { id: bill.status_master.id, name: bill.status_master.name },
          ])
        ).values()
      );

      // กรองบิลตามสถานะเริ่มต้น (Opened)
      this.filterBills();
    });
  }

  // ฟังก์ชันสำหรับกรองบิลตามสถานะ
  filterBills(): void {
    this.filteredBills = this.bills.filter(
      (bill) => bill.status_master.name === this.selectedStatus
    );
  }

  // เรียกเมื่อเปลี่ยนสถานะใน dropdown
  onStatusChange(): void {
    this.filterBills();
  }

  openDetailsModal(bill: any): void {
    this.selectedBill = bill;
    this.orderItemService.getOrderItemByBillId(bill.id).subscribe(
      (orderItems) => {
        this.selectedBill.order_items = orderItems;
        this.showDetailsModal = true;
      },
      (error) => {
        // Mock ข้อมูล order_items หาก API ยังไม่พร้อม
        this.selectedBill.order_items = [
          { id: 1, name: 'Espresso', unit_price: 60, amount: 2, total: 120 },
          { id: 2, name: 'Croissant', unit_price: 40, amount: 3, total: 120 },
          { id: 3, name: 'Orange Juice', unit_price: 50, amount: 1, total: 50 },
        ];
        this.showDetailsModal = true;
        console.warn('Mock order items used due to API error:', error);
      }
    );
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedBill = null;
  }

  goToOrder(billId: number): void {
    const formData = new FormData();
    formData.append('order[bill_id]', billId.toString());
    formData.append('order[staff_id]', '1');
    this.orderService.addOrder(formData).subscribe(
      (response) => {
        const orderId = response.id;
        this.router.navigate(['/order', billId, orderId]);
      },
      (error) => {
        Swal.fire('Error', `Failed to create order: ${error.message}`, 'error');
        console.error('Error creating order:', error);
      }
    );
  }

  openCheckBillModal(bill: any): void {
    this.selectedBill = bill;
    this.memberNumber = '';
    this.getPaid = null;
    this.submitted = false;
    this.showCheckBillModal = true;
  }

  closeCheckBillModal(): void {
    this.showCheckBillModal = false;
    this.selectedBill = null;
    this.memberNumber = '';
    this.getPaid = null;
    this.submitted = false;
  }

  isPaymentValid(): boolean {
    if (this.getPaid === null || this.getPaid < this.selectedBill.total_price) {
      return false;
    }
    return true;
  }

  confirmPayment(): void {
    this.submitted = true;

    if (!this.memberNumber) {
      Swal.fire('Error', 'Please enter member number.', 'error');
      return;
    }

    if (!this.isPaymentValid()) {
      Swal.fire('Error', 'Payment amount must be greater than or equal to total price.', 'error');
      return;
    }

    const paymentData = {
      bill: {
        bill_id: this.selectedBill.id,
        c_card: this.memberNumber,
        status_master_id: 6, // สถานะ Paid
        get_paid: this.getPaid,
        payment_date: new Date().toISOString(), // ใช้เวลาปัจจุบัน: 07:20 PM +07, May 31, 2025
      },
    };

    Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.billService.updateBill(this.selectedBill.id, paymentData).subscribe(
      () => {
        Swal.fire('Success', 'Bill checked successfully!', 'success');
        this.selectedBill.status_master_id = 6; // อัปเดตสถานะใน UI
        this.selectedBill.status_master.name = 'Paid'; // อัปเดตชื่อสถานะใน UI
        this.closeCheckBillModal();
        this.billService.getBills().subscribe((data) => {
          this.bills = data.map((bill: { genders: string; age_ranges: string }) => ({
            ...bill,
            genders: bill.genders ? JSON.parse(bill.genders) : [],
            age_ranges: bill.age_ranges ? JSON.parse(bill.age_ranges) : [],
          }));
          this.filterBills(); // กรองบิลใหม่หลังจากอัปเดต
        });
      },
      (error) => {
        Swal.fire('Error', `Failed to check bill: ${error.message}`, 'error');
        console.error('Error checking bill:', error);
      }
    );
  }
}