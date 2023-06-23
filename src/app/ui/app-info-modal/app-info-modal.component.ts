import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GITHUB_URL, MAIL_TO_EMAIL, TWITTER_URL } from '@godsWord/core/constants/generic.constants';
import { ModalService } from '@godsWord/core/modal/modal.service';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-app-info-modal',
  template: `
  <ion-header class="ion-no-border cb-dark">
    <ion-toolbar class="cb-dark">
      <ion-title class="tc-dark">{{ '' }}</ion-title>
      <ion-buttons class="tc-dark" slot="end">
        <ion-button class="ion-button-close" (click)="modalService.dismiss()"><ion-icon fill="clear" class="tc-dark" name="close-outline"></ion-icon></ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content [fullscreen]="true" [scrollEvents]="true" >
    <div class="container cb-dark tc-dark">
      <div class="title-wrapper displays-center">
        <h2>{{ 'COMMON.TITLE' | translate }} </h2>

        <span> {{ 'COMMON.CREATE_BY' | translate}}</span>
      </div>

      <div class="body-wrapper displays-center">
        <div>
          <p>{{ 'COMMON.APP_DESCRIPTION' | translate }}</p>
        </div>

        <div clas="empty-div"></div>

        <div>
          <p>{{ 'COMMON.APP_FIND' | translate}}</p>
        </div>

        <div clas="empty-div"></div>

        <div class="displays-center">
          <ion-icon name="mail-outline" (click)="redirect('email')"></ion-icon>
          <ion-icon name="logo-twitter" (click)="redirect('twitter')"></ion-icon>
          <ion-icon name="logo-github" (click)="redirect('github')"></ion-icon>
        </div>

        <div clas="empty-div">
          <br>
        </div>
        <div>
          <p>{{ 'COMMON.APP_FAREWELL' | translate}}</p>
        </div>
        <div>
          <p>{{ 'COMMON.VERSION' | translate}}</p>
        </div>
      </div>
    </div>
  </ion-content>
  `,
  styleUrls: ['./app-info-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppInfoModalComponent {

  constructor(
    public modalService: ModalService,
  ) { }


  redirect(to: 'email' | 'twitter' | 'github'): void {
    const actions = {
      'email':() => window.location.href = MAIL_TO_EMAIL,
      'twitter':() => window.location.href = TWITTER_URL,
      'github':() => window.location.href = GITHUB_URL
    }?.[to]?.();
  }

}
