import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentChangeAction} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { firestore } from 'firebase/app';
import { AuthState } from '../shared/auth.state';
import { Store } from '@ngxs/store';

export interface Photo {
  id?: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  createdAt: firestore.Timestamp;
  deleted?: boolean;
}

@Injectable()
export class PhotosService {
  private basePath;
  private photosCollection: AngularFirestoreCollection<Photo>;
  private photos: Observable<Photo[]>;
  public initialized: Promise<void>;

  constructor(private afs: AngularFirestore, private store: Store) {
    this.initialized = new Promise((resolve) => {
      store.selectOnce((state) => state.auth.user.uid).toPromise().then((userId) => {
        this.basePath = '/users/' + userId + '/photos';

        this.photosCollection = this.afs.collection(this.basePath);
        resolve();
      });
    });
  }

  getPhotos(): Observable<Photo[]> {
    if (!this.photosCollection) {
      return;
    }

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
