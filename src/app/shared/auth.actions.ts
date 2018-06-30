import { User } from './auth.model';
import { User as FirebaseUser } from 'firebase/app';

// Actions
export class CheckSession {
  static type = '[Auth] CheckSession';
}
export class LoginWithGoogle {
  static type = '[Auth] LoginWithGoogle';
}
export class LoginWithFacebook {
  static type = '[Auth] LoginWithFacebook';
}
export class FetchSignInMethodsForEmail {
  static type = '[Auth] FetchSignInMethodsForEmail';
  constructor(public email: string) {}
}
export class LoginWithEmailAndPassword {
  static type = '[Auth] LoginWithEmailAndPassword';
  constructor(public email: string, public password: string) {}
}
export class CreateUserWithEmailAndPassword {
  static type = '[Auth] CreateUserWithEmailAndPassword';
  constructor(public email: string, public password: string) {}
}
export class UpdateProfile {
  static type = '[Auth] UpdateProfile';
  constructor(public user: FirebaseUser, public profile: {
    displayName: string;
    photoURL: string;
  }) {}
}
export class UpdateProfileSuccess {
  static type = '[Auth] UpdateProfileSuccess';
  constructor() {}
}
export class UpdateProfileFailed {
  static type = '[Auth] UpdateProfileFailed';
  constructor(public error: any) {}
}
export class Logout {
  static type = '[Auth] Logout';
}
export class LogoutSuccess {
  static type = '[Auth] LogoutSuccess';
}

// Events
export class LoginRedirect {
  static type = '[Auth] LoginRedirect';
}
export class LoginSuccess {
  static type = '[Auth] LoginSuccess';
  constructor(public user: User) {}
}
export class CreateUserSuccess {
  static type = '[Auth] CreateUserSuccess';
  constructor(public user: User) {}
}
export class CreateUserFailed {
  static type = '[Auth] CreateUserFailed';
  constructor(public error: any) {}
}
export class FetchSignInMethodsSuccess {
  static type = '[Auth] FetchSignInMethodsSuccess';
  constructor(public methods: string[]) {}
}
export class LoginFailed {
  static type = '[Auth] LoginFailed';
  constructor(public error: any) {}
}
export class FetchSignInMethodsFailed {
  static type = '[Auth] FetchSignInMethodsFailed';
  constructor(public error: any) {}
}
