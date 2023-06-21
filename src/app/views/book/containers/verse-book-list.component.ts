import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ERROR_IMAGE, LAST_VERSE_STORAGE_KEY, NO_DATA_IMAGE } from '@godsWord/core/constants/generic.constants';
import { Feature } from '@godsWord/core/enums/feature.enum';
import { EntityStatus } from '@godsWord/core/enums/status.enum';
import { gotToTop, skeletonLength, trackById } from '@godsWord/core/functions/generic.functions';
import { PopoverService } from '@godsWord/core/modal/popover.service';
import { NotificationService } from '@godsWord/core/notifications/notification.service';
import { Book, BookService } from '@godsWord/features/book';
import { StorageService } from '@godsWord/features/storage';
import { VerseService } from '@godsWord/features/verse';
import { NoDataComponent } from '@godsWord/ui/no-data';
import { SkeletonCardComponent } from '@godsWord/ui/skeleton-card';
import { VerseCardComponent } from '@godsWord/ui/verse-card';
import { IonContent, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BookListPageState } from '../models/book-page.models';

@Component({
  selector: 'app-verse-book-list',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header cb-dark">
    </div>

    <div class="container cb-dark">
      <h1 class="tc-gradient">{{ 'COMMON.BOOK' | translate }}</h1>

      <div class="div-center">
        <h2 class="tc-sixtiary">{{ $any(state)?.bookName }}</h2>
      </div>

      <div class="empty-div"></div>

      <ng-container *ngIf="status === EntityStatus.Pending && firstLoad">
        <ng-container *ngTemplateOutlet="loader"></ng-container>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">

      <div class="w-92 displays-start">
        <div
          *ngFor="let chapter of info?.chapters; trackBy: trackById"
          class="passage-chip ta-center cb-sixtiary tc-secondary fs-27"
          [ngClass]="{'selected': chapter?.passage === $any(state)?.chapter}"
          (click)="changePassage(chapter?.passage!)">
          {{ chapter?.passage }}
        </div>
      </div>

      <ng-container *ngIf="status === EntityStatus.Pending">
        <div class="empty-div"></div>
        <ng-container *ngTemplateOutlet="loader"></ng-container>
      </ng-container>

      <div class="empty-div"></div>

        <ng-container *ngIf="status !== EntityStatus.Pending">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
            <ng-container *ngIf="info?.verses?.length! > 0; else noData">

              <app-verse-card
                *ngFor="let verse of info?.verses; trackBy: trackById"
                [chapter]="$any(state)?.chapter!"
                [verse]="verse"
                (onClick)="openPopover($event)">
              </app-verse-card>

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

      <!-- ILOADER  -->
      <ng-template #loader>
        <app-skeleton-card *ngFor="let item of skeletonLength()"></app-skeleton-card>
      </ng-template>
    </div>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./verse-book-list.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    VerseCardComponent,
    NoDataComponent,
    SkeletonCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerseBookListComponent  {

  gotToTop = gotToTop;
  trackById = trackById;
  skeletonLength = skeletonLength;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  EntityStatus = EntityStatus
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  status: EntityStatus = EntityStatus.Initial;
  state!: BookListPageState;
  firstLoad: boolean = true;

  triggerLoad = new EventEmitter<BookListPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({ bookName, reload, chapter }) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return forkJoin({
        books: this.servicesErrorHandling<Book>(this.bookService.getAll(reload), Feature.Book),
        verses: this.servicesErrorHandling<string>(this.verseService.getByPassage(chapter!, reload), Feature.Verse)
      }).pipe(
        map((responses) => {
          const { books, verses } = responses || {};
          const selectedBook = ((books as Book[]) || [])?.find((item) => item?.passage === bookName);
          const { chapters = [] } = selectedBook || {};

          this.status = EntityStatus.Loaded;
          this.firstLoad = false;

          return {
            chapters,
            verses,
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.VERSES');
          return of({chapters: [], verses: []});
        })
      )
    })
    // ,tap(d => console.log(d))
  );


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private bookService: BookService,
    private verseService: VerseService,
    private storageService: StorageService,
    private PopoverService: PopoverService,
    private notificationService: NotificationService,
  ) { }


  ionViewWillEnter(): void {
    const { params } = (this.route.snapshot.paramMap as Params)|| {};
    const { params: queryParams } = (this.route.snapshot.queryParamMap as Params)|| {};
    const { bookName } = params || {};

    this.state = {
      bookName,
      chapter: queryParams?.passage,
      reload: false
    };

    this.triggerLoad.next(this.state);
  }

  doRefresh(event: any): void {
    setTimeout(() => {
      this.state = {
        ...this.state,
        reload: true,
      }

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  changePassage(chapter: string): void {
    this.storageService.saveVerse(LAST_VERSE_STORAGE_KEY, chapter);

    this.state = {
      ...this.state,
      chapter,
      reload: false,
    };

    this.triggerLoad.next(this.state);
    this.router.navigate(['/book/'+ this.state.bookName], {queryParams:{ passage:chapter }});
  }

  servicesErrorHandling<T>(observable$: Observable<T[]>, feature: Feature): Observable<any>{
    const messages = {
      [Feature.Book]: 'ERRORS.BOOKS',
      [Feature.Verse]: 'ERRORS.VERSES',
      [Feature.VerseOfDay]: '',
      [Feature.LastVerse]: '',
    }?.[feature] || 'ERRORS.LOADING';

    return observable$.pipe(
      catchError(() => {
        this.notificationService.failure(messages);
        return of([])
      })
    );
  }

  openPopover({event, chapter, verse}: {event: any, chapter: string, verse: string}): void {
    this.PopoverService.open(event, { chapter, verse });
  }

  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }

}
