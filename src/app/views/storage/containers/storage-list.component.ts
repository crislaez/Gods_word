import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { ERROR_IMAGE, NO_DATA_IMAGE, SAVED_VERSE_STORAGE_KEY } from '@godsWord/core/constants/generic.constants';
import { EntityStatus } from '@godsWord/core/enums/status.enum';
import { ENVIRONMENT, Environment } from '@godsWord/core/environments/environment.token';
import { filterItem, gotToTop, skeletonLength, trackById } from '@godsWord/core/functions/generic.functions';
import { PopoverService } from '@godsWord/core/modal/popover.service';
import { NotificationService } from '@godsWord/core/notifications/notification.service';
import { StorageService } from '@godsWord/features/storage';
import { InfiniteScrollComponent } from '@godsWord/ui/infinite-scroll';
import { NoDataComponent } from '@godsWord/ui/no-data';
import { SkeletonCardComponent } from '@godsWord/ui/skeleton-card';
import { VerseCardComponent } from '@godsWord/ui/verse-card';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { StorageListPageState } from '../models/storage-page.models';

@Component({
  selector: 'app-storage-list',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header cb-dark">
    </div>

    <div class="container cb-dark">
      <h1 class="tc-gradient">{{ 'COMMON.SAVED' | translate }}</h1>

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

      <div class="empty-div"></div>

      <ng-container *ngIf="status === EntityStatus.Pending">
        <app-skeleton-card *ngFor="let item of skeletonLength()"></app-skeleton-card>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Pending">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
            <ng-container *ngIf="info?.verses?.length! > 0; else noData">

              <app-verse-card
                *ngFor="let verse of info?.verses; trackBy: trackById"
                [chapter]="$any(verse)?.chapter"
                [showChapter]="true"
                [verse]="$any(verse)?.verse"
                (onClick)="openPopover($event)">
              </app-verse-card>

              <app-infinite-scroll
                *ngIf="$any(info)?.verses?.length < $any(info)?.total"
                [slice]="$any(info)?.verses?.length || 0"
                [total]="$any(info)?.total || 0"
                (loadDataTrigger)="loadData($event)">
              </app-infinite-scroll>

            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>

      <!-- REFRESH -->
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- IS NO DATA  -->
      <ng-template #noData>
        <app-no-data [title]="'COMMON.NORESULT'" [image]="NO_DATA_IMAGE" [top]="'30vh'"></app-no-data>
      </ng-template>

      <!-- IS ERROR -->
      <ng-template #serverError>
        <app-no-data [title]="'COMMON.ERROR'" [image]="ERROR_IMAGE" [top]="'30vh'"></app-no-data>
      </ng-template>

    </div>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./storage-list.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    VerseCardComponent,
    NoDataComponent,
    SkeletonCardComponent,
    InfiniteScrollComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorageListComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  skeletonLength = skeletonLength;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  EntityStatus = EntityStatus
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  slice!: number;
  search = new FormControl(null);
  status: EntityStatus = EntityStatus.Initial;
  state!: StorageListPageState;
  triggerLoad = new EventEmitter<StorageListPageState>();

  info$ = this.triggerLoad.pipe(
    switchMap(({ search, slice }) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return from(this.storageService.loadVerses(SAVED_VERSE_STORAGE_KEY)).pipe(
        map((verses) => {
          this.status = EntityStatus.Loaded;
          const filterVerses = filterItem(search!, 'verse', verses);

          return {
            verses: filterVerses?.slice(0, slice),
            total: filterVerses?.length
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.BOOKS');

          return of({
            verses: [],
            total: 0
          })
        })
      )
    })
  );


  constructor(
    private platform: Platform,
    private cdRef: ChangeDetectorRef,
    private storageService: StorageService,
    private popoverService: PopoverService,
    @Inject(ENVIRONMENT) private env: Environment,
    private notificationService: NotificationService,
  ) {
    this.slice = this.env.perPage;
  }


  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.search.reset();
    this.state = {
      search: null!,
      slice: this.slice
    };

    this.triggerLoad.next(this.state);
  }

  searchSubmit(event: Event): void{
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.state = {
      search: this.search.value!,
      slice: this.slice
    };

    this.triggerLoad.next(this.state);
  }

  clearSearch(event: any): void{
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.search.reset();
    this.state = {
      search: null!,
      slice: this.slice
    };

    this.triggerLoad.next(this.state);
  }

  doRefresh(event: any): void {
    setTimeout(() => {
      this.search.reset();

      this.state = {
        search: null!,
        slice: this.slice
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  loadData(data: {event: any, total: number}): void {
    setTimeout(() => {
      const { event } = data || {};

      this.state = {
        search: null!,
        slice: this.state?.slice! + this.slice
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  async openPopover({event, chapter, verse}: {event: any, chapter: string, verse: string}): Promise<void> {
    const data = await this.popoverService.open(event, { chapter, verse }, false);
    if(!data) return;

    this.triggerLoad.next(this.state);
  }

  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }

}
