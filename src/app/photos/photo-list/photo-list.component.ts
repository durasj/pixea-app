import { Component, OnInit } from '@angular/core';
import { PhotosService, Photo } from '../photos.service';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';

@Component({
  selector: 'app-photo-list',
  templateUrl: './photo-list.component.html',
  styleUrls: ['./photo-list.component.scss']
})
export class PhotoListComponent implements OnInit {
  public photos$: Observable<Photo[]>;

  constructor(
    private service: PhotosService,
    private store: Store,
  ) {
    this.photos$ = service.getPhotos();
  }

  openPhoto(id: string) {
    this.store.dispatch(new Navigate(['/photo/' + id]));
  }

  ngOnInit() {
  }

}
