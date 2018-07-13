import { ApplicationRef } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Action, Selector, State, StateContext, Store, NgxsOnInit } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';

import { take, tap } from 'rxjs/operators';

import {
  CheckSession,
  LoginWithFacebook,
  LoginWithGoogle,
  LoginFailed,
  LoginRedirect,
  LoginSuccess,
  LoginWithEmailAndPassword,
  Logout,
  LogoutSuccess,
  FetchSignInMethodsForEmail,
  FetchSignInMethodsSuccess,
  FetchSignInMethodsFailed,
  CreateUserWithEmailAndPassword,
  CreateUserSuccess,
  CreateUserFailed,
  UpdateProfile,
  UpdateProfileSuccess,
  UpdateProfileFailed,
} from './auth.actions';
import { AuthStateModel, User as UserInfo } from './auth.model';
import { UserCredential } from '@firebase/auth-types';

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    initialized: false,
    user: null,
  }
})
export class AuthState implements NgxsOnInit {

  constructor(private store: Store, private afAuth: AngularFireAuth) {}

  /**
   * Selectors
   */
  @Selector()
  static getInitialized(state: AuthStateModel): boolean {
    return state.initialized;
  }

  @Selector()
  static getUser(state: AuthStateModel) {
    return state.user;
  }

  /**
   * Dispatch CheckSession on start
   */
  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch(new CheckSession());
  }

  /**
   * Commands
   */
  @Action(CheckSession)
  checkSession(ctx: StateContext<AuthStateModel>) {
    return this.afAuth.authState.pipe(
      take(1),
      tap((user: UserInfo) => {
        ctx.patchState({ initialized: true });
        if (user) {
          ctx.dispatch(new LoginSuccess(user));
          return;
        }
      })
    );
  }

  @Action(LoginWithGoogle)
  loginWithGoogle(ctx: StateContext<AuthStateModel>) {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.auth.signInWithPopup(provider).then(
      (response: { user: UserInfo }) => {
        ctx.dispatch(new LoginSuccess(response.user));
      })
      .catch(error => {
        ctx.dispatch(new LoginFailed(error));
      });
  }

  @Action(LoginWithFacebook)
  loginWithFacebook(ctx: StateContext<AuthStateModel>) {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.afAuth.auth.signInWithPopup(provider).then(
      (response: { user: UserInfo }) => {
        ctx.dispatch(new LoginSuccess(response.user));
      })
      .catch(error => {
        ctx.dispatch(new LoginFailed(error));
      });
  }

  @Action(FetchSignInMethodsForEmail)
  fetchSignInMethodsForEmail(ctx: StateContext<AuthStateModel>, action: FetchSignInMethodsForEmail) {
    return this.afAuth.auth.fetchSignInMethodsForEmail(action.email).then(
      (methods: string[]) => {
        ctx.dispatch(new FetchSignInMethodsSuccess(methods));
      })
      .catch(error => {
        ctx.dispatch(new FetchSignInMethodsFailed(error));
      });
  }

  @Action(LoginWithEmailAndPassword)
  loginWithEmailAndPassword(ctx: StateContext<AuthStateModel>, action: LoginWithEmailAndPassword) {
    return this.afAuth.auth.signInWithEmailAndPassword(action.email, action.password).then(
      (user: UserCredential) => {
        ctx.dispatch(new LoginSuccess(user.user));
      })
      .catch(error => {
        ctx.dispatch(new LoginFailed(error));
      });
  }

  @Action(CreateUserWithEmailAndPassword)
  createUserWithEmailAndPassword(ctx: StateContext<AuthStateModel>, action: CreateUserWithEmailAndPassword) {
    return this.afAuth.auth.createUserWithEmailAndPassword(action.email, action.password).then(
      ({ user }) => {
        ctx.dispatch(new CreateUserSuccess(user));
      })
      .catch(error => {
        ctx.dispatch(new CreateUserFailed(error));
      });
  }

  @Action(UpdateProfile)
  updateProfile(ctx: StateContext<AuthStateModel>, action: UpdateProfile) {
    return action.user.updateProfile(action.profile).then(
      () => {
        ctx.dispatch(new UpdateProfileSuccess());
      })
      .catch(error => {
        ctx.dispatch(new UpdateProfileFailed(error));
      });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    return this.afAuth.auth.signOut().then(
      () => {
        ctx.dispatch(new LogoutSuccess());
      });
  }

  /**
   * Events
   */

  @Action([LoginSuccess, CreateUserSuccess])
  onLoginSuccess(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch(new Navigate(['/']));
  }

  @Action(LoginRedirect)
  onLoginRedirect(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch(new Navigate(['/auth']));
  }

  @Action([LoginSuccess, CreateUserSuccess])
  setUserStateOnSuccess(ctx: StateContext<AuthStateModel>, event: LoginSuccess) {
    ctx.patchState({
      user: event.user
    });
  }

  @Action([LoginFailed, LogoutSuccess])
  setUserStateOnFailure(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      user: undefined
    });
    ctx.dispatch(new LoginRedirect());
  }

  @Action(FetchSignInMethodsFailed)
  onFetchSignInMethodsFailed(ctx: StateContext<AuthStateModel>) {
    ctx.dispatch(new Navigate(['/auth/email']));
  }

}
