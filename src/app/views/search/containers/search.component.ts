import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { ERROR_IMAGE, NO_DATA_IMAGE, SEARCH_IMAGE } from '@godsWord/core/constants/generic.constants';
import { EntityStatus } from '@godsWord/core/enums/status.enum';
import { gotToTop, trackById } from '@godsWord/core/functions/generic.functions';
import { VerseService } from '@godsWord/features/verse';
import { NoDataComponent } from '@godsWord/ui/no-data';
import { SpinnerComponent } from '@godsWord/ui/spinner';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { EMPTY, catchError, map, of, switchMap, tap } from 'rxjs';
import { SearchPageState } from '../models/search-page.models';


@Component({
  selector: 'app-search',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header cb-dark">
    </div>

    <div class="container cb-dark">
      <h1 class="tc-gradient">{{ 'COMMON.SEARCH' | translate }}</h1>

      <div class="empty-div"></div>

      <div class="displays-center w-100">
        <form (submit)="searchSubmit($event)">
          <ion-searchbar animated="true"
            [placeholder]="'FILTERS.BY_VERSE' | translate"
            [formControl]="search"
            (ionClear)="clearSearch($event)">
          </ion-searchbar>
        </form>
      </div>

      <!-- <div class="empty-div"></div> -->

      <ng-container *ngIf="status === EntityStatus.Pending">
        <ng-container *ngTemplateOutlet="loader"></ng-container>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info; else searchMessage">

        <ng-container *ngIf="status !== EntityStatus.Pending">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">

            <ion-card *ngIf="$any(info)?.preview; else noData" class="cb-light w-94 tc-sixtiary p-10">
                {{ $any(info)?.preview }}
            </ion-card>

          </ng-container>
        </ng-container>
      </ng-container>

      <!-- REFRESH -->
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- IS NO DATA  -->
      <ng-template #noData>
        <app-no-data [title]="'COMMON.NORESULT'" [image]="NO_DATA_IMAGE" [top]="'10vh'"></app-no-data>
      </ng-template>

      <!-- IS ERROR -->
      <ng-template #serverError>
        <app-no-data [title]="'COMMON.ERROR'" [image]="ERROR_IMAGE" [top]="'10vh'"></app-no-data>
      </ng-template>

      <!-- SEARCH MESSAGE-->
      <ng-template #searchMessage>
        <app-no-data [title]="'COMMON.SEARCH_BOOK_OR_PASSAGE'" [image]="SEARCH_IMAGE" [top]="'10vh'"></app-no-data>
      </ng-template>

      <!-- LOADER  -->
      <ng-template #loader>
        <app-spinner></app-spinner>
      </ng-template>
    </div>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    NoDataComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent  {

  gotToTop = gotToTop;
  trackById = trackById;
  ERROR_IMAGE = ERROR_IMAGE;
  SEARCH_IMAGE = SEARCH_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  EntityStatus = EntityStatus
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  search = new FormControl(null);
  status: EntityStatus = EntityStatus.Initial;

  state!: SearchPageState;
  triggerLoad = new EventEmitter<SearchPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({ search, reload }) => {
      if(reload || !search){
        return of(null)
      }

      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.verseService.getSearch(search!).pipe(
        map(item => {
          this.status = EntityStatus.Loaded;
          return item || {}
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          return of({})
        })
      )
    })
  );


  constructor(
    private platform: Platform,
    private cdRef: ChangeDetectorRef,
    private verseService: VerseService
  ) { }


  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.search.reset();
  }

  searchSubmit(event: Event): void{
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.state = {
      search: this.search.value!,
      reload: false
    };

    this.triggerLoad.next(this.state);
  }

  clearSearch(event: any): void{
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.search.reset();
    this.state = {
      search: null!,
      reload: true
    };

    this.triggerLoad.next(this.state);
  }

  doRefresh(event: any): void {
    setTimeout(() => {
      this.search.reset();
      this.state = {
        search: null!,
        reload: true
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }

}
