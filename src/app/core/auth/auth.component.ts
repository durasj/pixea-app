import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { FormControl, FormGroup, Validators, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import EmailAuthProvider = firebase.auth.EmailAuthProvider;
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import TwitterAuthProvider = firebase.auth.TwitterAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;
import { User } from 'firebase';
import * as md5 from 'md5';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  public emailLoginActivated = false;
  public emailPasswordActivated = false;
  public newAccount = false;
  public existingAccountProvider: 'Email' | 'Google' | 'Twitter' | 'Facebook';
  public loading = false;
  public email: string;

  @ViewChild('emailForm') emailForm: NgForm;
  @ViewChild('createForm') createForm: NgForm;

  constructor(
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router,
    private ngZone: NgZone
  ) { }

  signWithGoogle() {
    this.loading = true;

    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((data) => {
        this.redirectToDash();
      })
      .catch((error) => {
        this.loading = false;
        console.error('Problem signing in', error);
      });
  }

  signWithFacebook() {
    this.loading = true;

    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
      .then((data) => {
        this.redirectToDash();
      })
      .catch((error) => {
        this.loading = false;
        console.error('Problem signing in', error);
      });
  }

  signWithTwitter() {
    this.loading = true;

    this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider())
      .then((data) => {
        this.redirectToDash();
      })
      .catch((error) => {
        this.loading = false;
        console.error('Problem signing in', error);
      });
  }

  continueWithEmail(form: NgForm) {
    if (!form.valid) {
      this.snackBar.open('Please check the form for errors.', 'OK', {
        duration: 3000
      });
      return;
    }

    this.email = this.emailForm.controls.email.value;
    this.loading = true;

    this.afAuth.auth.fetchProvidersForEmail(this.email)
      .then((providers: string[]) => {
        this.loading = false;

        if (providers.length === 0) {
          this.newAccount = true;
        } else if (providers.indexOf(EmailAuthProvider.PROVIDER_ID) !== -1) {
          this.newAccount = false;
          this.emailLoginActivated = false;
          this.emailPasswordActivated = true;
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
        this.loading = false;

        if (err.code === 'auth/invalid-email') {
          this.snackBar.open('Please enter a valid e-mail address', 'OK', {
            duration: 3000
          });
        }
      });
  }

  signWithEmail(form: NgForm) {
    this.loading = true;

    firebase.auth().signInWithEmailAndPassword(
      this.email,
      form.controls.password.value
    ).then(() => {
      this.redirectToDash();
    }, (error) => {
      this.loading = false;
      const errorCode = error.code;

      if (errorCode === 'auth/invalid-email') {
        this.snackBar.open('Please enter a valid e-mail address.', 'OK', {
          duration: 3000
        });
      }

      if (errorCode === 'auth/user-disabled') {
        this.snackBar.open('Your account is disabled.', 'OK', {
          duration: 3000
        });
      }

      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        this.snackBar.open('Wrong password or e-mail.', 'OK', {
          duration: 3000
        });
      }
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

    this.afAuth.auth.createUserWithEmailAndPassword(
      this.email,
      form.controls.password.value
    ).catch((error) => {
      this.loading = false;

      const errorCode = error.code;
      const errorMessage = error.message;

      if (errorCode === 'auth/invalid-email') {
        this.snackBar.open('Please enter a valid e-mail address', 'OK', {
          duration: 3000
        });
      }

      if (errorCode === 'auth/weak-password') {
        this.snackBar.open('Provided password is not strong enough.', 'OK', {
          duration: 3000
        });
        console.error(errorMessage);
      }
    }).then((user: User) => {
      user.updateProfile({
        displayName: [
          form.controls.first.value,
          form.controls.last.value
        ].join(' '),
        photoURL: this.getGravatarURL(user)
      }).then(() => {
        this.redirectToDash();
      }, (error) => {
        console.error(error);
        this.loading = false;
      });
    });
  }

  signWithExisting() {
    this['signWith' + this.existingAccountProvider]();
  }

  private redirectToDash() {
    // Run from the firebase callback so could cause issues otherwise
    this.ngZone.run(() => {
      this.router.navigate(['/']);
    });
  }

  private getGravatarURL(user: User) {
    return 'http://www.gravatar.com/avatar/' + md5(user.email);
  }

  ngOnInit() {
  }

}
