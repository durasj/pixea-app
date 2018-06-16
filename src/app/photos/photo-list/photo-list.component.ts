import { Component, OnInit } from '@angular/core';
import { PhotosService, Photo } from '../photos.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-photo-list',
  templateUrl: './photo-list.component.html',
  styleUrls: ['./photo-list.component.scss']
})
export class PhotoListComponent implements OnInit {
  public photos$: Observable<Photo[]>;

  constructor(
    private service: PhotosService
  ) {
    this.photos$ = service.getPhotos();
  }

  ngOnInit() {
  }

}
