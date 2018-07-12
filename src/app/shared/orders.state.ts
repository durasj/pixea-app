import { State, Store, Action, StateContext } from '@ngxs/store';
import { OrdersStateModel } from './orders.model';
import { PrepareOrder } from './orders.actions';
import { Navigate } from '@ngxs/router-plugin';

@State<OrdersStateModel>({
    name: 'orders',
    defaults: {
        newOrder: null
    }
})
export class OrdersState {

    constructor(private store: Store) {}

    /**
     * Commands
     */
    @Action(PrepareOrder)
    checkSession(ctx: StateContext<OrdersStateModel>, action: PrepareOrder) {
        ctx.patchState({
            newOrder: {
                photos: action.photos
            }
        });
        ctx.dispatch(new Navigate(['/orders/new']));
    }

}
