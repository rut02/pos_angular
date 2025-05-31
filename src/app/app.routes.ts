import { Routes } from '@angular/router';
import { ProductComponent } from './pages/product/product.component';
import { TableComponent } from './pages/table/table.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { BillComponent } from './pages/bills/bill/bill.component';
import { HeaderComponent } from './pages/header/header.component';
import { ReservationListComponent } from './pages/reservation-list/reservation-list.component';
import { BillListComponent } from './pages/bills/bill-list/bill-list.component';
import { OrderComponent } from './pages/order/order.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';

export const routes: Routes = [
    {path: 'products', component: ProductComponent},
    {path: 'table', component: TableComponent},
    {path: 'add-reservation', component: ReservationComponent},
    {path: 'list-reservation', component: ReservationListComponent},
    {path:'bill', component: BillComponent},
    {path:'list-bill', component: BillListComponent},
    {path:'order/:billId/:orderId',component:OrderComponent},
    {path: 'order-management', component: OrderManagementComponent},
    // {path:'showbill', component: ShowbillComponent},
    {path: 'menu', component: HeaderComponent},
    // {path:'nav', component: MenuComponent}
];
