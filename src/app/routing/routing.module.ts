import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from '../core/auth/auth.component';
import { ProfileComponent } from '../core/profile/profile.component';
import { PageNotFoundComponent } from '../core/page-not-found/page-not-found.component';

import { AuthGuard } from './auth.guard';
import { DashComponent } from '../core/dash/dash.component';

export const appRoutes: Routes = [
    { path: 'auth', component: AuthComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: '',
        redirectTo: '/photos',
        pathMatch: 'full'
    },
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes),
  ],
  exports: [
    RouterModule
  ],
  declarations: [],
  providers: [
    AuthGuard
  ]
})
export class RoutingModule { }
