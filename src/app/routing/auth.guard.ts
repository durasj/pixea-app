import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { map } from 'rxjs/operators';

import { LoginRedirect } from '../shared/auth.actions';
import { AuthState } from '../shared/auth.state';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private store: Store,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.store.selectOnce(AuthState.getUser).pipe(
      map(u => {
        if (!u) {
          this.store.dispatch(new LoginRedirect());
        }
        return true;
      })
    );
  }

}
