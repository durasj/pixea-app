import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentChangeAction} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

export interface Photo {
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
  }

  getPhotos() {
    return this.photosCollection.snapshotChanges().pipe(map(changes =>
      changes.map(a => {
        const data = a.payload.doc.data() as Photo;
        const photoId = a.payload.doc.id;
        return { id: photoId, ...data };
      })
    ));
  }

  getPhoto(id: string) {
    return this.photosCollection.doc<Photo>(id).snapshotChanges().pipe(map(changes => {
      const data = changes.payload.data() as Photo;
      const photoId = changes.payload.id;
      return { id: photoId, ...data };
    }));
  }

  addPhoto(data: Photo) {
    this.photosCollection.add(data);
  }
}
