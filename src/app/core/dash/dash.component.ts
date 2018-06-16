import { Component, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { pluck } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { User } from '@firebase/auth-types';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnInit {

  public isSmallScreen: boolean;
  public authInfo$: Observable<User>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private afAuth: AngularFireAuth,
    private router: Router,
  ) {
    this.authInfo$ = this.afAuth.authState;
  }

  logout() {
    this.afAuth.auth.signOut();
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
