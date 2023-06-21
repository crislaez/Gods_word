import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { ERROR_IMAGE, LAST_VERSE_STORAGE_KEY, NO_DATA_IMAGE } from '@godsWord/core/constants/generic.constants';
import { EntityStatus } from '@godsWord/core/enums/status.enum';
import { ENVIRONMENT, Environment } from '@godsWord/core/environments/environment.token';
import { filterItem, gotToTop, skeletonLength, trackById } from '@godsWord/core/functions/generic.functions';
import { NotificationService } from '@godsWord/core/notifications/notification.service';
import { Book, BookService } from '@godsWord/features/book';
import { StorageService } from '@godsWord/features/storage';
import { BookCardComponent } from '@godsWord/ui/book-card';
import { InfiniteScrollComponent } from '@godsWord/ui/infinite-scroll';
import { NoDataComponent } from '@godsWord/ui/no-data';
import { SkeletonCardComponent } from '@godsWord/ui/skeleton-card';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, map, of, switchMap } from 'rxjs';
import { BooksPageState } from '../models/books-page.models';



@Component({
  selector: 'app-books-list',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header cb-dark">
    </div>

    <div class="container cb-dark">
      <h1 class="tc-gradient">{{ 'COMMON.BOOKS' | translate }}</h1>

      <div class="empty-div"></div>

      <div class="displays-center w-100">
        <form (submit)="searchSubmit($event)">
          <ion-searchbar animated="true"
            [placeholder]="'FILTERS.BY_BOOK' | translate"
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
            <ng-container *ngIf="info?.books?.length! > 0; else noData">

              <app-book-card
                *ngFor="let book of info?.books; trackBy: trackById"
                [verse]="book?.passage!"
                (onClick)="redirectTo($event, $any(info)?.books)">
              </app-book-card>

              <app-infinite-scroll
                *ngIf="$any(info)?.books?.length < $any(info)?.total"
                [slice]="$any(info)?.books?.length || 0"
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
  styleUrls: ['./books-list.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    NoDataComponent,
    BookCardComponent,
    SkeletonCardComponent,
    InfiniteScrollComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooksListComponent {

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
  state!: BooksPageState;

  triggerLoad = new EventEmitter<BooksPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({slice, search, reload}) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.bookService.getAll(reload).pipe(
        map(books => {
          this.status = EntityStatus.Loaded;
          const filterBooks = filterItem(search!, 'passage', books)

          return {
            books: filterBooks?.slice(0, slice),
            total: filterBooks?.length
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.BOOKS');
          return of({books: [], total: 0})
        })
      )
    })
  );


  constructor(
    private router: Router,
    private platform: Platform,
    private cdRef: ChangeDetectorRef,
    private bookService: BookService,
    private storageService: StorageService,
    @Inject(ENVIRONMENT) private env: Environment,
    private notificationService: NotificationService,
  ) {
    this.slice = this.env.perPage;
  }


  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.search.reset();
    this.state = this.changeState();
    this.triggerLoad.next(this.state);
  }

  searchSubmit(event: Event): void{
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.state = this.changeState({search: this.search.value!});
    this.triggerLoad.next(this.state);
  }

  clearSearch(event: any): void{
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.search.reset();
    this.state = this.changeState();
    this.triggerLoad.next(this.state);
  }

  doRefresh(event: any): void {
    setTimeout(() => {
      this.search.reset();
      this.state = this.changeState({reload: true});
      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  loadData(data: {event: any, total: number}): void {
    setTimeout(() => {
      const { event } = data || {};

      this.state = this.changeState({slice: this.state?.slice! + this.slice});
      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  redirectTo(bookName: string, books: Book[]): void {
    if(!bookName) return;
    const selectedBook = (books || [])?.find(item => item?.passage === bookName);
    const { chapters = []} = selectedBook || {};
    const [ firstBook ] = chapters;
    const { passage } = firstBook || {};
    this.storageService.saveVerse(LAST_VERSE_STORAGE_KEY, passage);
    this.router.navigate(['/book/'+ bookName], {queryParams:{ passage }});
  }

  changeState(state?: BooksPageState): BooksPageState {
    const { slice = this.slice, search = null!, reload = false} = state || {};
    return {
      slice,
      search,
      reload
    };
  }

  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }


}
