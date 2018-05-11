import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderListComponent } from './order-list/order-list.component';

import { CoreModule } from '../core/core.module';

import { AuthGuard } from '../routing/auth.guard';

const ordersRoutes = [
  { path: 'orders',  component: OrderListComponent, canActivate: [AuthGuard] },
  { path: 'order/:id', component: OrderDetailComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ordersRoutes),

    CoreModule,
  ],
  declarations: [
    OrderDetailComponent,
    OrderListComponent
  ]
})
export class OrdersModule { }
