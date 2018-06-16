import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PhotoDetailComponent } from './photo-detail/photo-detail.component';
import { PhotoListComponent } from './photo-list/photo-list.component';

import { CoreModule } from '../core/core.module';

import { PhotosService } from './photos.service';
import { AuthGuard } from '../routing/auth.guard';

const photosRoutes: Routes = [
  { path: 'photos',  component: PhotoListComponent, canActivate: [AuthGuard] },
  { path: 'photo/:id', component: PhotoDetailComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(photosRoutes),

    CoreModule,
  ],
  declarations: [
    PhotoDetailComponent,
    PhotoListComponent,
  ],
  providers: [
    PhotosService
  ]
})
export class PhotosModule { }
