import { Component, OnInit } from '@angular/core';
import { OrdersService, Order } from '../orders.service';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  public orders$: Observable<Order[]>;

  constructor(
    private service: OrdersService,
    private store: Store,
  ) {
    service.initialized.then(() => {
      this.orders$ = service.getOrders().pipe(
        map((orders) =>
          orders
            .filter((order) => order.deleted !== true)
            .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
        )
      );
    });
  }

  ngOnInit() {
  }

}
