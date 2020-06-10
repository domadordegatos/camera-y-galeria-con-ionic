import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { PhotoI } from '../models/photo.interface';
import { Camera, CameraOptions } from '@ionic-native/camera';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public photos:PhotoI[]=[];
  constructor(private photoSvc:PhotoService) {

    
  }

    public newPhoto():void{
      this.photoSvc.addNewToGallery()
    }

    ngOnInit(){
      this.photoSvc.loadSaved().then(()=>{
        this.photos = this.photoSvc.getPhotos();
      });
    }


}
