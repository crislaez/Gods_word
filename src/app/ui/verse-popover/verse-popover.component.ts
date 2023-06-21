import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Share } from '@capacitor/share';
import { SAVED_VERSE_STORAGE_KEY, SHARED_WEB_URL } from '@godsWord/core/constants/generic.constants';
import { filterNoRepeatItem } from '@godsWord/core/functions/generic.functions';
import { NotificationService } from '@godsWord/core/notifications/notification.service';
import { StorageService } from '@godsWord/features/storage';
import { IonicModule, NavParams, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-verse-popover',
  template: `
    <ion-list lines="none">
      <ion-item detail (click)="sharedContent()">
        <ion-icon name="arrow-redo-outline"></ion-icon>
        {{ 'COMMON.SEND' | translate }}
      </ion-item>
      <ion-item detail *ngIf="isSave" (click)="saveVerse()">
        <ion-icon name="save-outline"></ion-icon>
        {{ 'COMMON.SAVE' | translate }}
      </ion-item>
      <ion-item detail *ngIf="!isSave" (click)="deleteVerse()">
        <ion-icon name="trash-outline"></ion-icon>
        {{ 'COMMON.DELETE' | translate }}
      </ion-item>
      <ion-item detail="false" (click)="close()">
        <ion-icon name="close-outline"></ion-icon>
        {{ 'COMMON.CLOSE' | translate }}
      </ion-item>
    </ion-list>
  `,
  styleUrls: ['./verse-popover.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersePopoverComponent  {

  info!: { chapter: string, verse: string };
  isSave: boolean = true;


  constructor(
    private navParams: NavParams,
    private storageService: StorageService,
    public popoverController: PopoverController,
    private notificationService: NotificationService,
  ) {
    this.info = this.navParams.get('info');
    this.isSave = this.navParams.get('isSave');
  }


  async sharedContent(): Promise<void> {
    const url = SHARED_WEB_URL?.replace('VERSE', this.info?.chapter?.replace(/ /g,'')); //TODO SEND TOO SINGLE VERSE

    await Share.share({
      title: this.info?.chapter,
      text: this.info.verse,
      url,
      dialogTitle: this.info?.chapter
    });

    this.popoverController.dismiss(null)
  }

  async saveVerse(): Promise<void> {
    const allSaveVerses = await this.storageService.loadVerses(SAVED_VERSE_STORAGE_KEY);

    const updateSaveVerses = filterNoRepeatItem([
      ...(allSaveVerses || []),
      ...(this.info ? [ this.info ] : [])
    ], 'verse');

    await this.storageService.saveVerse(SAVED_VERSE_STORAGE_KEY, updateSaveVerses);
    this.notificationService.success('SAVES.VERSES');

    this.close('save');
  }

  async deleteVerse(): Promise<void> {
    const allSaveVerses = await this.storageService.loadVerses(SAVED_VERSE_STORAGE_KEY);
    const { chapter, verse } = this.info || {};

    const updateSaveVerses = (allSaveVerses || [])?.filter((item: any) => {
      const { chapter: storageChapter, verse: storageVerse } = item || {};

      if(storageChapter === chapter && storageVerse === verse) return false;
      return true
    });

    await this.storageService.saveVerse(SAVED_VERSE_STORAGE_KEY, updateSaveVerses);
    this.notificationService.success('DELETE.VERSES');

    this.close('delete');
  }

  close(from: 'save' | 'delete' = null!): void {
    this.popoverController.dismiss(from)
  }


}
