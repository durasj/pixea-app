import { OrdersStateModel } from './orders.model';

// Actions
export class PrepareOrder {
  static type = '[Order] PrepareOrder';
  constructor(public photos: string[]) {}
}
