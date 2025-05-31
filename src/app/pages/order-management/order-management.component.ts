import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.component.html',
})
export class OrderManagementComponent implements OnInit {
  orders: any[] = [];
  originalOrders: any[] = [];
  filterStatus: string = '';
  selectedOrder: any = null;
  showDetailsModal: boolean = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe(
      (data) => {
        this.originalOrders = data.map((order: any) => {
          // คำนวณ total_price จาก order_items หากไม่มีใน API
          const orderItems = order.order_items.map((item: any) => {
            const unitPrice = item.unit_price || 50; // สมมติ unit_price ถ้าไม่มีในข้อมูล
            return {
              name: item.product?.name || 'Unknown',
              amount: item.amount || 0,
              unit_price: unitPrice,
              total: unitPrice * (item.amount || 0),
            };
          });
          return {
            ...order,
            status: order.status_master?.name || 'Unknown',
            table_name: order.bill?.table?.name || 'N/A',
            order_items: orderItems,
            total_price: order.total_price || orderItems.reduce((sum: number, item: any) => sum + item.total, 0),
          };
        });
        this.filterOrders();
      },
      (error) => {
        Swal.fire('Error', `Failed to load orders: ${error.message}`, 'error');
        console.error('Error loading orders:', error);
        // Mock data หาก API ล้มเหลว
        this.originalOrders = [
          {
            id: 5,
            bill_id: 1,
            doc_no: 'Order-20250531-5',
            table_name: 'Table 3',
            status: 'Pending',
            order_items: [
              { name: 'Burger', amount: 2, unit_price: 50, total: 100 },
              { name: 'shrim', amount: 2, unit_price: 50, total: 100 },
            ],
            total_price: 200,
          },
        ];
        this.filterOrders();
      }
    );
  }

  filterOrders(): void {
    if (this.filterStatus) {
      this.orders = this.originalOrders.filter((o) => o.status === this.filterStatus);
    } else {
      this.orders = [...this.originalOrders];
    }
  }

  openDetailsModal(order: any): void {
    this.selectedOrder = order;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  updateStatus(orderId: number, newStatusId: number): void {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      Swal.fire({
        title: 'Confirm Status Change',
        text: `Are you sure you want to change the status of order ${order.doc_no}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          this.orderService.updateOrder(orderId, { status_master_id: newStatusId }).subscribe(
            () => {
              this.orderService.getOrders().subscribe(
                (data) => {
                  const updatedOrder = data.find((o: any) => o.id === orderId);
                  if (updatedOrder) {
                    order.status = updatedOrder.status_master?.name || 'Unknown';
                    Swal.fire('Success', `Order ${order.doc_no} status updated to ${order.status}`, 'success');
                  }
                },
                (error) => {
                  Swal.fire('Error', `Failed to fetch updated order: ${error.message}`, 'error');
                }
              );
            },
            (error) => {
              Swal.fire('Error', `Failed to update status: ${error.message}`, 'error');
              console.error('Error updating status:', error);
            }
          );
        }
      });
    }
  }
}