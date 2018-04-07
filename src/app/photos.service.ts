import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

interface Photo {
  id?: string;
  name: string;
  userId: number;
}

@Injectable()
export class PhotosService {
  private basePath = '/photos';
  private photosCollection: AngularFirestoreCollection<Photo>;
  private photos: Observable<Photo[]>;

  constructor(private afs: AngularFirestore) {
    this.photosCollection = this.afs.collection('photos');
    this.photos = this.photosCollection.valueChanges();

    this.photos.subscribe(console.log);
  }

  addPhoto(data: Photo) {
    this.photosCollection.add(data);
  }
}
