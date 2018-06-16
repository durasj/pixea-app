import { TestBed, inject } from '@angular/core/testing';

import { PhotosService } from './photos.service';
import { AngularFirestore } from 'angularfire2/firestore';

describe('PhotosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhotosService, AngularFirestore]
    });
  });

  it('should be created', inject([PhotosService], (service: PhotosService) => {
    expect(service).toBeTruthy();
  }));
});
