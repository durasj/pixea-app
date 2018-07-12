import { Injectable } from '@angular/core';
import { firestore } from 'firebase/app';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

export interface Order {
  id?: string;
  photos: string[];
  type?: string;
  size?: string;
  name?: string;
  email?: string;
  number?: string;
  comment?: string;
  createdAt: firestore.Timestamp;
  deleted?: boolean;
}

@Injectable()
export class OrdersService {
  private basePath;
  private ordersCollection: AngularFirestoreCollection<Order>;
  private orders: Observable<Order[]>;
  public initialized: Promise<void>;

  constructor(private afs: AngularFirestore, private store: Store) {
    this.initialized = new Promise((resolve) => {
      store.selectOnce((state) => state.auth.user.uid).toPromise().then((userId) => {
        this.basePath = '/users/' + userId + '/orders';

        this.ordersCollection = this.afs.collection(this.basePath);
        resolve();
      });
    });
  }

  getOrders(): Observable<Order[]> {
    if (!this.ordersCollection) {
      return;
    }

    return this.ordersCollection.snapshotChanges().pipe(map(changes =>
      changes.map((a): Order => {
        const data = a.payload.doc.data() as Order;
        const orderId = a.payload.doc.id as string;
        return { id: orderId, ...data };
      })
    ));
  }

  getOrder(id: string) {
    return this.ordersCollection.doc<Order>(id).snapshotChanges().pipe(map(changes => {
      const data = changes.payload.data() as Order;
      const orderId = changes.payload.id;
      return { id: orderId, ...data };
    }));
  }

  addOrder(data: Order) {
    return this.ordersCollection.add(data);
  }

  updateOrder(photo: Order, updates: Partial<{}>) {
    return this.ordersCollection.doc(photo.id).update(updates);
  }

  deleteOrder(photo: Order) {
    return this.ordersCollection.doc(photo.id).update({ deleted: true });
  }

  recoverOrder(photo: Order) {
    return this.ordersCollection.doc(photo.id).update({ deleted: false });
  }
}
