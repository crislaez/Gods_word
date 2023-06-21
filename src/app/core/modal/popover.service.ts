import { Injectable } from '@angular/core';
import { VersePopoverComponent } from '@godsWord/ui/verse-popover';
import { PopoverController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PopoverService {

  constructor(
    public popoverController: PopoverController
  ) { }


  async open(event: any, info: { chapter: string, verse: string }, isSave: boolean = true): Promise<any> {
    const popover = await this.popoverController.create({
      component: VersePopoverComponent,
      cssClass: 'my-custom-class',
      event: event,
      translucent: true,
      componentProps:{
        info,
        isSave
      }
    });

    await popover.present();

    const { role, data } = await popover.onDidDismiss();
    return data

  }
}
