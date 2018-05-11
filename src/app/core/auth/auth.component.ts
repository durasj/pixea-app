import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import EmailAuthProvider = firebase.auth.EmailAuthProvider;
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import TwitterAuthProvider = firebase.auth.TwitterAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  public emailLoginActivated = false;
  public newAccount = false;
  public existingAccountProvider: 'Email' | 'Google' | 'Twitter' | 'Facebook';

  public emailFormControl = new FormControl();

  public firstNameFormControl = new FormControl();
  public lastNameFormControl = new FormControl();
  public passwordFormControl = new FormControl();
  public passwordRepeatFormControl = new FormControl();

  constructor(
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  signWithGoogle() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((data) => {
        this.redirectToDash();
      })
      .catch((error) => {
        console.error('Problem signing in', error);
      });
  }

  signWithFacebook() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
      .then((data) => {
        this.redirectToDash();
      })
      .catch((error) => {
        console.error('Problem signing in', error);
      });
  }

  signWithTwitter() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider())
      .then((data) => {
        this.redirectToDash();
      })
      .catch((error) => {
        console.error('Problem signing in', error);
      });
  }

  signWithEmail() {
    const email = this.emailFormControl.value;

    this.afAuth.auth.fetchProvidersForEmail(email)
      .then((providers: string[]) => {
        if (providers.length === 0) {
          this.newAccount = true;
        } else if (providers.indexOf(EmailAuthProvider.PROVIDER_ID) !== -1) {
          this.newAccount = false;
          this.existingAccountProvider = 'Email';
        } else if (providers.indexOf(GoogleAuthProvider.PROVIDER_ID) !== -1) {
          this.newAccount = false;
          this.existingAccountProvider = 'Google';
        } else if (providers.indexOf(TwitterAuthProvider.PROVIDER_ID) !== -1) {
          this.newAccount = false;
          this.existingAccountProvider = 'Twitter';
        } else if (providers.indexOf(FacebookAuthProvider.PROVIDER_ID) !== -1) {
          this.newAccount = false;
          this.existingAccountProvider = 'Facebook';
        }

        this.emailLoginActivated = false;
      }, (err) => {
        if (err.code === 'auth/invalid-email') {
          this.snackBar.open('Please enter a valid e-mail address');
        }

        console.error(err, err.code);
      });
  }

  signWithExisting() {
    this['signWith' + this.existingAccountProvider]();
  }

  private redirectToDash() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
  }

}
