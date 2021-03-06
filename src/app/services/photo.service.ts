import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, 
  CameraPhoto, CameraSource } from '@capacitor/core';
import { PhotoI } from '../models/photo.interface';


const { Camera, Filesystem, Storage } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class PhotoService {


  private photos: PhotoI[] = [];
  private PHOTO_STORAGE: string = "photos";

  constructor() { }

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, 
      source: CameraSource.Camera, 
      quality: 100 
    });

    const saveImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(saveImageFile);

    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos.map(p => {
              // Don't save the base64 representation of the photo data, 
              // since it's already saved on the Filesystem
              const photoCopy = { ...p };
              delete photoCopy.base64;
    
              return photoCopy;
              }))
    });

  }

      public async loadSaved() {
      // Retrieve cached photo array data
      const photos = await Storage.get({ key: this.PHOTO_STORAGE });
      this.photos = JSON.parse(photos.value) || [];

      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: FilesystemDirectory.Data
        });
      
        // Web platform only: Save the photo into the base64 field
        photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
      }
      
    }


  public getPhotos():PhotoI[]{
    return this.photos;
  }

  private async savePicture(cameraPhoto: CameraPhoto) {
    const base64Data = await this.readAsBase64(cameraPhoto);

    // Write the file to the data directory
      const fileName = new Date().getTime() + '.jpeg';
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: FilesystemDirectory.Data
      });

      return await this.getPhotoFile(cameraPhoto,fileName);
  }

  private async getPhotoFile(cameraPho:CameraPhoto, fileName: string): Promise<PhotoI>{
    return {
      filepath: fileName,
      webviewPath: cameraPho.webPath
    }
  }
  
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
  
    return await this.convertBlobToBase64(blob) as string;  
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

}
