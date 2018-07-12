import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderListComponent } from './order-list/order-list.component';

import { CoreModule } from '../core/core.module';

import { AuthGuard } from '../routing/auth.guard';
import { OrdersState } from '../shared/orders.state';
import { OrdersService } from './orders.service';
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatListModule,
  MatLineModule,
  MatExpansionModule
} from '@angular/material';
import { OrderNewComponent } from './order-new/order-new.component';

const ordersRoutes = [
  { path: 'orders',  component: OrderListComponent, canActivate: [AuthGuard] },
  { path: 'orders/new', component: OrderNewComponent, canActivate: [AuthGuard] },
  { path: 'order/:id', component: OrderDetailComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ordersRoutes),
    NgxsModule.forFeature([
      OrdersState
    ]),

    CoreModule,
    FormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatListModule,
    MatLineModule,
    MatExpansionModule,
  ],
  declarations: [
    OrderDetailComponent,
    OrderListComponent,
    OrderNewComponent,
  ],
  providers: [
    OrdersService
  ]
})
export class OrdersModule { }
