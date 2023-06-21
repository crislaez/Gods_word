import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ERROR_IMAGE, LAST_VERSE_STORAGE_KEY, NO_DATA_IMAGE } from '@godsWord/core/constants/generic.constants';
import { Feature } from '@godsWord/core/enums/feature.enum';
import { EntityStatus } from '@godsWord/core/enums/status.enum';
import { gotToTop, numberDay, skeletonLength, trackById } from '@godsWord/core/functions/generic.functions';
import { NotificationService } from '@godsWord/core/notifications/notification.service';
import { BOOKS } from '@godsWord/features/book/utils/book.utils';
import { StorageService } from '@godsWord/features/storage';
import { VerseService } from '@godsWord/features/verse';
import { VERSE_OF_DAY } from '@godsWord/features/verse/utils/verse-of-day';
import { NoDataComponent } from '@godsWord/ui/no-data';
import { SpinnerComponent } from '@godsWord/ui/spinner';
import { IonContent, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, catchError, forkJoin, from, map, of, switchMap } from 'rxjs';


@Component({
  selector: 'app-home',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header cb-dark">
    </div>

    <div class="container cb-dark">
      <h1 class="tc-gradient">{{ 'COMMON.HOME' | translate }}</h1>

      <ng-container *ngIf="statusLoadVerse === EntityStatus.Pending">
        <app-spinner></app-spinner>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="statusLoadVerse !== EntityStatus.Pending">
          <ng-container *ngIf="statusLoadVerse !== EntityStatus.Error; else serverError">

            <ng-container>
              <div class="empty-div"></div>

              <div *ngIf="info?.lastVerse"
                class="last-verse-div displays-between-center cb-light tc-sixtiary"
                (click)="redirectTo(info?.lastVerse)">
                <div class="fw-bold">{{ 'COMMON.LAST_VERSE' | translate }}:</div>
                <div class="tc-primary">{{ info?.lastVerse }}</div>
                <div><ion-icon name="eye-outline"></ion-icon></div>
              </div>
            </ng-container>

            <div class="div-center">
              <h2 class="tc-sixtiary">{{ 'COMMON.DAILY_DEVOTIONAL' | translate }}</h2>
            </div>

            <div class="empty-div"></div>

            <div *ngIf="info?.verseOfDay"
              class="last-verse-div cb-light tc-sixtiary">
              <div class="fw-bold">{{ $any(verseOfDay)?.title }}</div>
              <div class="empty-div"></div>
              <div >{{ info?.verseOfDay }}</div>
            </div>

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
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    NoDataComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  skeletonLength = skeletonLength;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  EntityStatus = EntityStatus
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  verseOfDay!: {title: string, verse: string};
  statusLoadVerse: EntityStatus = EntityStatus.Initial;
  triggerLoad = new EventEmitter<boolean>();

  info$ = this.triggerLoad.pipe(
    switchMap((reload) => {
      this.statusLoadVerse = EntityStatus.Pending;
      this.verseOfDay = VERSE_OF_DAY?.[numberDay() ?? 0];
      this.cdRef.detectChanges();

      return forkJoin({
        lastVerse: this.servicesErrorHandling(from(this.storageService.loadVerses(LAST_VERSE_STORAGE_KEY)), Feature.LastVerse),
        verseOfDay: this.servicesErrorHandling(this.verseService.getVersesOfDay(this.verseOfDay?.verse!, reload), Feature.VerseOfDay)
      }).pipe(
        map((responses) => {
          const { lastVerse, verseOfDay } = responses || {};
          this.statusLoadVerse = EntityStatus.Loaded;

          return {
            lastVerse: lastVerse?.length !== 0 ? lastVerse : null,
            verseOfDay
          }
        }),
        catchError(() => {
          this.statusLoadVerse = EntityStatus.Error;
          this.notificationService.failure('ERRORS.LOADING');
          return of({
            lastVerse: null,
            verseOfDay: null
          });
        })
      )
    })
    // ,tap(d => console.log(d))
  );


  constructor(
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private verseService: VerseService,
    private storageService: StorageService,
    private notificationService: NotificationService,
  ) { }


  ionViewWillEnter(): void {
    this.triggerLoad.next(false);
  }

  doRefresh(event: any): void {
    setTimeout(() => {
      this.triggerLoad.next(true);
      event.target.complete();
    }, 500);
  }

  redirectTo(lastVerse: string): void {
    const lastVerseSplitted = lastVerse?.split(' ') || [];
    const [ _, ...restBook ] = [...(lastVerseSplitted ?? [])]?.reverse();
    const bookName = [...(restBook ?? [])]?.reverse()?.join(' ');
    const spanishBookName = (BOOKS as any)?.[bookName] || bookName;

    this.router.navigate(['/book/'+ spanishBookName], {queryParams:{ passage: lastVerse }});
  }

  servicesErrorHandling<T>(observable$: Observable<T[]>, feature: Feature): Observable<string | any> {
    const messages = {
      [Feature.Book]: '',
      [Feature.Verse]: '',
      [Feature.VerseOfDay]: 'ERRORS.VERSE_OF_DAY',
      [Feature.LastVerse]: 'ERRORS.LAST_VERSE',
    }?.[feature] || 'ERRORS.LOADING';


    return observable$.pipe(
      catchError(() => {
        this.notificationService.failure(messages);
        return of({})
      })
    );
  }


  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }


}
