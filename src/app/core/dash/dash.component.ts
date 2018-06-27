import { Component, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { pluck } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { User } from '@firebase/auth-types';
import { Store, Select } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { AuthState } from '../../shared/auth.state';
import { Logout } from '../../shared/auth.actions';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnInit {

  public isSmallScreen: boolean;
  public authInfo$: Observable<User>;

  @Select(state => state.auth.user) user$: Observable<AuthState>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private afAuth: AngularFireAuth,
    private router: Router,
    private store: Store,
  ) { }

  navigate(route: string) {
    this.store.dispatch(new Navigate([route]));
  }

  logout() {
    this.store.dispatch(new Logout());
  }

  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width: 901px)'])
      .pipe(pluck('matches'))
      .subscribe((m: boolean) => this.isSmallScreen = m);
  }

  get sidenavMode() {
    return this.isSmallScreen ? 'over' : 'side';
  }

}
