import { Injectable } from '@angular/core';
import { AppInfoModalComponent } from '@godsWord/ui/app-info-modal';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private modalController: ModalController,
  ) { }


  async openInfo(): Promise<void>  {
    const modal = await this.modalController.create({
      component: AppInfoModalComponent,
    });

    modal.present();
    await modal.onDidDismiss();
  }

  dismiss(): void {
    this.modalController.dismiss({
      'dismissed': true
    });
  }
}
