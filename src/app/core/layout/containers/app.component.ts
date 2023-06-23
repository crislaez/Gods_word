import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterModule } from '@angular/router';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { ModalService } from '@godsWord/core/modal/modal.service';
import { GenericObj } from '@godsWord/core/models/generic.models';
import { IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map, shareReplay } from 'rxjs';
import { trackById } from '../../functions/generic.functions';

@Component({
  selector: 'app-root',
  template: `
  <ion-app>
    <!-- HEADER  -->
    <ion-header class="ion-no-border" >
      <ion-toolbar *ngIf="(currentSection$ | async) as currentSection">

        <!-- nav icon  -->
        <ion-back-button
          *ngIf="!excludesURL?.includes(currentSection?.route!)"
          class="tc-sixtiary"
          slot="start"
          [defaultHref]="redirectoTo(currentSection)"
          [text]="''">
        </ion-back-button>

        <!-- title  -->
        <ion-title class="tc-dark">
          {{ $any(currentSection)?.title | translate }}
        </ion-title>

        <ion-icon
          class="tc-dark"
          slot="end"
          name="ellipsis-horizontal-outline"
          (click)="modalService.openInfo()">
        </ion-icon>
      </ion-toolbar>

    </ion-header>

    <!-- RUTER  -->
    <ion-router-outlet id="main"></ion-router-outlet>

    <!-- TAB FOOTER  -->
    <ion-tabs  *ngIf="(currentSection$ | async) as currentSection">
      <ion-tab-bar class="cb-dark" slot="bottom">
        <ion-tab-button
          *ngFor="let item of footerList; trackBy: trackById"
          [ngClass]="{ 'active-class': [item?.link].includes(currentSection?.route) }"
          class="tc-primary"
          [routerLink]="[item?.link]"
        >
          <ion-icon [name]="item?.icon"></ion-icon>
          {{ item?.label! | translate }}
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-app>
  `,
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterModule,
  ]
})
export class AppComponent {

  trackById = trackById;
  excludesURL: string [] = ['home', 'storage', 'books', 'discipleship', 'search'];

  footerList = [
    {id:1, link:'home', icon:'home-outline', label: 'COMMON.HOME'},
    {id:2, link:'books', icon:'book-outline', label: 'COMMON.BOOKS'},
    {id:3, link:'storage', icon:'bookmark-outline', label: 'COMMON.SAVED'},
    {id:4, link:'discipleship', icon:'file-tray-full-outline', label: 'COMMON.DISCIPLESHIPS'},
    {id:5, link:'search', icon:'search-outline', label: 'COMMON.SEARCH'}
  ];

  currentSection$ = this.router.events.pipe(
    filter((event: any) => event instanceof NavigationStart),
    map((event: NavigationEnd) => {
      const { url = ''} = event || {};
      const [, route = 'home', params = null ] = url?.split('/') || [];
      return {
        'home':{route, title: 'COMMON.TITLE'},
        'book':{route, title: 'COMMON.TITLE'},
        'books':{route, title: 'COMMON.TITLE'},
        'storage':{route, title: 'COMMON.TITLE'},
        'discipleship':{route, title: 'COMMON.TITLE'},
        'search':{route, title: 'COMMON.TITLE'},
      }?.[route] || {route: 'home', title:'COMMON.TITLE'};
    }),
    // tap(d => console.log(d)),
    shareReplay(1)
  );

  constructor(
    private router: Router,
    // private location: Location,
    private platform: Platform,
    // private menu: MenuController,
    public modalService: ModalService,
  ) {
    if(!this.platform.is('mobileweb')){
      this.lockAppOrientation();
    }
  }


  redirectoTo(currentSection: GenericObj<any>): string {
    // this.location.back();
    const { route, params } = currentSection || {};
    // if(['predicaciones']?.includes(params)) return '/albums';

    const redirectTo: {[key:string]: string} = {
      'home':'/home',
    };

    return redirectTo?.[route] || '/home';
  }

  async lockAppOrientation(): Promise<void> {
    await ScreenOrientation.lock({orientation: 'portrait'})
  }
}
