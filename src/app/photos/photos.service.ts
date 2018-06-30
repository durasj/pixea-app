import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentChangeAction} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { firestore } from 'firebase/app';

export interface Photo {
  id?: string;
  name: string;
  date: firestore.Timestamp;
  url?: string;
  thumbnailUrl?: string;
  deleted?: boolean;
}

@Injectable()
export class PhotosService {
  private basePath = '/photos';
  private photosCollection: AngularFirestoreCollection<Photo>;
  private photos: Observable<Photo[]>;

  constructor(private afs: AngularFirestore) {
    this.photosCollection = this.afs.collection('photos');
  }

  getPhotos(): Observable<Photo[]> {
    return this.photosCollection.snapshotChanges().pipe(map(changes =>
      changes.map((a): Photo => {
        const data = a.payload.doc.data() as Photo;
        const photoId = a.payload.doc.id as string;
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
    return this.photosCollection.add(data);
  }

  updatePhoto(photo: Photo, updates: Partial<{}>) {
    return this.photosCollection.doc(photo.id).update(updates);
  }

  deletePhoto(photo: Photo) {
    return this.photosCollection.doc(photo.id).update({ deleted: true });
  }

  recoverPhoto(photo: Photo) {
    return this.photosCollection.doc(photo.id).update({ deleted: false });
  }

}
