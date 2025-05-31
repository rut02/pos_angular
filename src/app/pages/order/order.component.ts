import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { BillService } from '../../services/bill.service';
import { OrderItemService } from '../../services/order-item.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
})
export class OrderComponent implements OnInit {
  products: any[] = [];
  bills: any[] = [];
  showAddOrderModal: boolean = false;
  selectedProduct: any = null;
  order: any = { bill_id: null, product_id: null, amount: 1 };
  billId: number | null = null;
  orderId: number | null = null;
  cart: any[] = [];

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private billService: BillService,
    private orderItemService: OrderItemService,
    private route: ActivatedRoute
  ) {}

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.unit_price * item.amount), 0);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.billId = Number(params.get('billId'));
      this.orderId = Number(params.get('orderId'));
      this.order.bill_id = this.billId;
    });

    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });

    this.billService.getBills().subscribe((data) => {
      this.bills = data;
    });
  }

  openAddOrderModal(product: any): void {
    if (!this.billId || !this.orderId) {
      Swal.fire('Error', 'No bill or order selected. Please select a bill first.', 'error');
      return;
    }

    this.selectedProduct = product;
    this.order.product_id = product.id;
    this.order.bill_id = this.billId;
    this.showAddOrderModal = true;
  }

  closeAddOrderModal(): void {
    this.showAddOrderModal = false;
    this.selectedProduct = null;
    this.order = { bill_id: this.billId, product_id: null, amount: 1 };
  }

  increaseAmount(): void {
    this.order.amount++;
  }

  decreaseAmount(): void {
    if (this.order.amount > 1) this.order.amount--;
  }

  addToCart(): void {
    if (!this.order.bill_id || !this.order.amount || this.order.amount < 1) {
      Swal.fire('Error', 'Please specify a valid amount.', 'error');
      return;
    }

    const cartItem = {
      order_id: this.orderId,
      product_id: this.order.product_id,
      amount: this.order.amount,
      unit_price: this.selectedProduct.unit_price,
      name: this.selectedProduct.name
    };

    const existingItemIndex = this.cart.findIndex(item => item.product_id === cartItem.product_id);
    if (existingItemIndex !== -1) {
      this.cart[existingItemIndex].amount += cartItem.amount;
    } else {
      this.cart.push(cartItem);
    }

    // Swal.fire('Success', `Added ${cartItem.amount} ${cartItem.name} to cart!`, 'success');
    this.order.amount = 1;
    this.closeAddOrderModal();
  }

  removeFromCart(index: number): void {
    const item = this.cart[index];
    this.cart.splice(index, 1);
  }

  confirmOrder(): void {
    if (this.cart.length === 0) {
      Swal.fire('Error', 'Your cart is empty. Please add items to order.', 'error');
      return;
    }

    const total = this.getCartTotal();
    Swal.fire({
      title: 'Confirm Order',
      text: `Total: ${total.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}. Proceed?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        const promises = this.cart.map(item => {
          const formData = new FormData();
          formData.append('order_item[order_id]', item.order_id!.toString());
          formData.append('order_item[product_id]', item.product_id.toString());
          formData.append('order_item[amount]', item.amount.toString());
          formData.append('order_item[unit_price]', item.unit_price.toString());
          return this.orderItemService.addOrderItem(formData).toPromise();
        });

        Swal.fire({
          title: 'Processing...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        Promise.all(promises).then(() => {
          Swal.fire('Success', 'Order items added successfully!', 'success');
          this.cart = [];
        }).catch((error: HttpErrorResponse) => {
          Swal.fire('Error', `Failed to add order items: ${error.message}`, 'error');
          console.error('Error adding order items:', error);
        });
      }
    });
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150?text=No+Image';
  }
}