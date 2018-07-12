import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Order, OrdersService } from '../orders.service';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { UserInfo } from '@firebase/auth-types';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { firestore } from 'firebase/app';
import { Navigate } from '@ngxs/router-plugin';

@Component({
  selector: 'app-order-new',
  templateUrl: './order-new.component.html',
  styleUrls: ['./order-new.component.scss']
})
export class OrderNewComponent implements AfterViewInit {

  public photos$: Observable<string[]>;

  @Select(state => state.orders.newOrder) order$: Observable<Order>;
  @Select(state => state.auth.user) user$: Observable<UserInfo>;

  @ViewChild('createForm') createForm: NgForm;

  constructor(private snackBar: MatSnackBar, private service: OrdersService, private store: Store) {
    this.photos$ = this.order$.pipe(
      map((order) => order.photos)
    );
  }

  async createOrder() {
    if (!this.createForm.valid) {
      this.snackBar.open('Please check the form for errors.', 'OK', {
        duration: 3000
      });
      return;
    }

    const order = this.service.addOrder({
      photos: await this.photos$.first().toPromise(),
      type: this.createForm.controls.type.value,
      size: this.createForm.controls.size.value,
      name: this.createForm.controls.name.value,
      email: this.createForm.controls.email.value,
      number: this.createForm.controls.number.value,
      comment: this.createForm.controls.comment.value,
      // TODO: Do this server-side
      createdAt: firestore.Timestamp.now(),
    });

    this.store.dispatch(new Navigate(['/orders']));
  }

  // TODO: Uggh ... ugly ... you know what to do with me ...
  ngAfterViewInit() {
    this.user$.subscribe((user) => {
      setTimeout(() => {
        this.createForm.controls.name.setValue(user.displayName);
        this.createForm.controls.email.setValue(user.email);
      });
    });
  }

}
