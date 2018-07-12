import { Component, OnInit, HostListener } from '@angular/core';
import { PhotosService, Photo } from '../photos.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';
import { Store, Select } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { UploadTaskSnapshot } from 'angularfire2/storage/interfaces';
import { UserInfo } from '@firebase/auth-types';
import { MatSnackBar } from '@angular/material';
import { map } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import { PrepareOrder } from '../../shared/orders.actions';

@Component({
  selector: 'app-photo-list',
  templateUrl: './photo-list.component.html',
  styleUrls: ['./photo-list.component.scss']
})
export class PhotoListComponent implements OnInit {
  public photos$: Observable<Photo[]>;

  // Upload tasks for photo IDs
  uploadTasks: { [key: string]: AngularFireUploadTask } = {};

  // Upload snapshots for photo IDs
  uploadSnapshots: { [key: string]: Observable<UploadTaskSnapshot> } = {};

  // Progress for photo IDs
  uploadProgress: { [key: string]: Observable<number> } = {};

  // Selected photos IDs
  selected = new Set<string>();

  // State for dropzone CSS toggling
  isHovering: boolean;

  @Select(state => state.auth.user) user$: Observable<UserInfo>;

  // TODO: Refactor to use ngxs
  constructor(
    private service: PhotosService,
    private store: Store,
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private snackBar: MatSnackBar,
  ) {
    service.initialized.then(() => {
      this.photos$ = service.getPhotos().pipe(
        map((photos) =>
          photos
            .filter((photo) => photo.deleted !== true)
            .map((photo) => ({ ...photo, ext: photo.name.match(/\.[0-9a-z]+$/i)[0] }))
            .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
        )
      );
    });
  }

  addedFiles(event: FileList) {
    for (let i = 0; i < event.length; i++) {
      this.startUpload(event.item(i));
    }
  }

  async startUpload(file: File) {
    // Client-side validation example
    if (file.type.split('/')[0] !== 'image') {
      this.snackBar.open(
        'Error: Unsupported file type. Only images are allowed.',
        'OK',
        { duration: 3000 }
      );
      return;
    }

    const photo = await this.service.addPhoto({
      name: file.name,
      // TODO: Do this server-side
      createdAt: firestore.Timestamp.now(),
    });

    // The storage path
    const path = `photos/${photo.id}`;

    // TODO: Find out if there is a better way to do this due to security
    const user = await this.user$.first().toPromise();

    this.uploadTasks[photo.id] = this.storage.upload(
      path,
      file,
      { customMetadata: {
        originalName: file.name,
        createdBy: user.uid,
      } }
    );

    this.uploadProgress[photo.id] = this.uploadTasks[photo.id].percentageChanges().pipe(
      map(percentage => Math.round(percentage))
    );

    this.uploadSnapshots[photo.id] = this.uploadTasks[photo.id].snapshotChanges();

    try {
      const finalSnapshot = await this.uploadTasks[photo.id];

      const url = await finalSnapshot.ref.getDownloadURL();

      photo.update('url', url);
    } catch (error) {
      this.handleError(error);
    }

    delete this.uploadProgress[photo.id];
  }

  prepareOrder() {
    this.store.dispatch(new PrepareOrder(Array.from(this.selected)));
  }

  pause($event: Event, photo: Photo) {
    event.stopPropagation();

    this.uploadTasks[photo.id].pause();
  }

  resume($event: Event, photo: Photo) {
    event.stopPropagation();

    this.uploadTasks[photo.id].resume();
  }

  cancel($event: Event, photo: Photo) {
    event.stopPropagation();

    this.uploadTasks[photo.id].cancel();

    this.service.deletePhoto(photo);
  }

  async markAsDeleted(event: Event, photo: Photo) {
    event.stopPropagation();

    this.service.deletePhoto(photo);

    this.snackBar.open(
      'Photo has been deleted',
      'UNDO',
      { duration: 5000 }
    ).onAction().subscribe(() => {
      this.service.recoverPhoto(photo);
    });
  }

  handleError(error) {
    let message = '';

    switch (error.code) {
      case 'storage/canceled':
        // User canceled the upload
        message = undefined;
        break;

      case 'storage/quota_exceeded':
        message = 'Upload failed, we have been notified and are working on the problem.';
        break;

      case 'storage/unknown':
        message = 'Upload error, server response: ' + error.serverResponse;
        break;

      default:
        message = 'Upload error: ' + error.message;
        break;
    }

    if (message) {
      this.snackBar.open(
        'Error: ' + message,
        'OK',
        { duration: 3000 }
      );
    }
  }

  ngOnInit() {
  }

}
