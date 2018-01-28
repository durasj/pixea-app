import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PhotosService {
  private basePath = '/photos';

  constructor(private db: AngularFireDatabase) {

    setTimeout(() => {
      this.addPhoto({
        name: 'Dalsia',
        userId: 12
      });
    }, 2000);

    this.getPhotos(this.basePath).subscribe((data) => {
      console.log(data);
    });
  }

  addPhoto(data) {
    const obj = this.db.database.ref(this.basePath);
    obj.push(data);
    console.log('Success');
  }

  getPhotos(path): Observable<any[]> {
    return this.db.list(path).valueChanges();
  }
}
