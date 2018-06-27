import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { FormControl, FormGroup, Validators, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { User } from 'firebase';
import * as md5 from 'md5';
import { Store, Actions, ofActionDispatched, Select } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { Observable } from 'rxjs/Observable';

import EmailAuthProvider = firebase.auth.EmailAuthProvider;
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;
import {
  LoginWithGoogle,
  LoginWithFacebook,
  LoginFailed,
  FetchSignInMethodsForEmail,
  FetchSignInMethodsSuccess,
  FetchSignInMethodsFailed,
  LoginWithEmailAndPassword,
  CreateUserFailed,
  CreateUserWithEmailAndPassword,
  CreateUserSuccess,
  UpdateProfile,
  UpdateProfileFailed,
} from '../../shared/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  // TODO: Consider moving to the state store
  public emailStatus: Observable<'new' | 'existing' | 'Google' | 'Facebook'>;
  public loading = false;

  @Select(state => state.router.state.url) url$: Observable<string>;

  @ViewChild('emailForm') emailForm: NgForm;
  @ViewChild('createForm') createForm: NgForm;

  constructor(
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private store: Store,
    private actions$: Actions,
    private route: ActivatedRoute,
  ) {
    this.url$.subscribe((url) => {
      if (url.indexOf('/auth/email/') === 0) {
        // TODO: Refactor, we should get email from the param and not the URL
        const email = url.replace('/auth/email/', '');

        this.checkEmail(email);
      }
    });
  }

  signWithGoogle() {
    this.loading = true;
    this.store.dispatch(new LoginWithGoogle());
  }

  signWithFacebook() {
    this.loading = true;
    this.store.dispatch(new LoginWithFacebook());
  }

  navigate(route: string) {
    this.store.dispatch(new Navigate(['auth/' + route]));
  }

  continueWithEmail(form: NgForm) {
    if (!form.valid) {
      this.snackBar.open('Please check the form for errors.', 'OK', {
        duration: 3000
      });
      return;
    }

    const email = this.emailForm.controls.email.value;

    this.navigate('email/' + email);
  }

  signWithEmail(form: NgForm) {
    if (!form.valid) {
      this.snackBar.open('Please check the form for errors.', 'OK', {
        duration: 3000
      });
      return;
    }

    this.loading = true;

    this.url$.subscribe((url) => {
      // TODO: Refactor, we should get email from the param and not the URL
      const email = url.replace('/auth/email/', '');

      this.store.dispatch(new LoginWithEmailAndPassword(email, form.controls.password.value));
    });
  }

  createWithEmail(form: NgForm) {
    if (!form.valid) {
      this.snackBar.open('Please check the form for errors.', 'OK', {
        duration: 3000
      });
      return;
    }

    if (form.controls.password.value !== form.controls.passwordAgain.value) {
      this.snackBar.open('Passwords do not match.', 'OK', {
        duration: 3000
      });
      return;
    }

    this.loading = true;

    this.url$.subscribe((url) => {
      // TODO: Refactor, we should get email from the param and not the URL
      const email = url.replace('/auth/email/', '');

      this.actions$.pipe(ofActionDispatched(CreateUserSuccess)).subscribe(
        ({ user }) => {
          this.store.dispatch(
            new UpdateProfile(user, {
              displayName: [
                form.controls.first.value,
                form.controls.last.value
              ].join(' '),
              photoURL: this.getGravatarURL(user)
            })
          );
        }
      );

      this.store.dispatch(
        new CreateUserWithEmailAndPassword(email, form.controls.password.value)
      );
    });
  }

  signWithExisting() {
    this['signWith' + this.emailStatus]();
  }

  private getGravatarURL(user: User) {
    return 'http://www.gravatar.com/avatar/' + md5(user.email);
  }

  private errorMessageFromCode(code: string) {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid e-mail address';

      case 'auth/user-disabled':
        return 'Your account is disabled.';

      case 'auth/user-not-found':
        return 'Wrong password or e-mail.';

      case 'auth/wrong-password':
        return 'Wrong password or e-mail.';

      case 'auth/popup-closed-by-user':
        return 'Popup was closed before finishing the sign in process.';

      case 'auth/weak-password':
        return 'Provided password is not strong enough.';

      default:
        return 'Login failed. Please try it again.';
    }
  }

  private checkEmail(email) {
    this.loading = true;

    this.emailStatus = new Observable<'new' | 'existing' | 'Google' | 'Facebook'>(
      (observer) => {
        const { next, error } = observer;

        this.actions$.pipe(ofActionDispatched(FetchSignInMethodsSuccess)).subscribe(
          ({ methods }) => next(this.checkEmailResult(methods))
        );

        this.store.dispatch(new FetchSignInMethodsForEmail(email));
      }
    );
  }

  private checkEmailResult(methods) {
    if (methods.length === 0) {
      return 'new';
    } else if (methods.indexOf(EmailAuthProvider.PROVIDER_ID) !== -1) {
      return 'existing';
    } else if (methods.indexOf(GoogleAuthProvider.PROVIDER_ID) !== -1) {
      return 'Google';
    } else if (methods.indexOf(FacebookAuthProvider.PROVIDER_ID) !== -1) {
      return 'Facebook';
    }

    this.loading = false;
  }

  ngOnInit() {
    this.actions$.pipe(ofActionDispatched(
      LoginFailed,
      FetchSignInMethodsFailed,
      CreateUserFailed,
      UpdateProfileFailed,
    )).subscribe(
      (data) => {
        this.snackBar.open(
          'Error: ' + this.errorMessageFromCode(data.error.code),
          'OK',
          { duration: 3000 }
        );

        this.emailStatus = undefined;
        this.loading = false;
      }
    );
  }

}
