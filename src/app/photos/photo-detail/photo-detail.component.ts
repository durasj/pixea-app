import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';

import { PhotosService, Photo } from '../photos.service';

@Component({
  selector: 'app-photo-detail',
  templateUrl: './photo-detail.component.html',
  styleUrls: ['./photo-detail.component.scss']
})
export class PhotoDetailComponent implements OnInit {
  public photo$: Observable<Photo>;

  constructor(
    private route: ActivatedRoute,
    private service: PhotosService,
  ) {

  }

  ngOnInit() {
    this.photo$ = this.route.paramMap
      .switchMap((params: ParamMap) =>
        this.service.getPhoto(params.get('id')));
  }

}
