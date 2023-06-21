import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@godsWord/core/constants/generic.constants';
import { EntityStatus } from '@godsWord/core/enums/status.enum';
import { gotToTop, isNotEmptyObject, skeletonLength, trackById } from '@godsWord/core/functions/generic.functions';
import { NotificationService } from '@godsWord/core/notifications/notification.service';
import { DiscipleshipService, Discipleships } from '@godsWord/features/discipleship';
import { NoDataComponent } from '@godsWord/ui/no-data';
import { SkeletonCardComponent } from '@godsWord/ui/skeleton-card';
import { VerseCardComponent } from '@godsWord/ui/verse-card';
import { IonContent, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-discipleship-list',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header cb-dark">
    </div>

    <div class="container cb-dark">
      <h1 class="tc-gradient">{{ 'COMMON.DISCIPLESHIPS' | translate }}</h1>

      <div class="empty-div"></div>

      <ng-container *ngIf="status === EntityStatus.Pending">
        <app-skeleton-card *ngFor="let item of skeletonLength()"></app-skeleton-card>
      </ng-container>

      <ng-container *ngIf="(discipleship$ | async) as discipleship">
        <ng-container *ngIf="status !== EntityStatus.Pending">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
            <ng-container *ngIf="isNotEmptyObject(discipleship); else noData">

              <ion-accordion-group class="w-94">
                <ion-accordion
                  *ngFor="let item of transformDiscipleship($any(discipleship)); trackBy: trackById"
                  class="cb-dark">
                  <ion-item slot="header"
                    class="tc-sixtiary">
                    <ion-label class="fw-bold tt-capitalize">{{ item?.id }}</ion-label>
                  </ion-item>

                  <div slot="content">
                    <app-verse-card
                      *ngFor="let verse of item?.verses; trackBy: trackById"
                      [chapter]="$any(verse)?.book"
                      [showChapter]="true"
                      [verse]="$any(verse)?.passage"
                      [showActtionButton]="false">
                    </app-verse-card>
                  </div>

                </ion-accordion>
              </ion-accordion-group>

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
  styleUrls: ['./discipleship-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    VerseCardComponent,
    NoDataComponent,
    SkeletonCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscipleshipListComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  skeletonLength = skeletonLength;
  isNotEmptyObject = isNotEmptyObject;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  EntityStatus = EntityStatus
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  status: EntityStatus = EntityStatus.Initial;

  triggerLoad = new EventEmitter<boolean>();
  discipleship$ = this.triggerLoad.pipe(
    switchMap((reload) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.discipleshipService.getAll(reload).pipe(
        tap(() => this.status = EntityStatus.Loaded),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.LOADING');
          return of({})
        })
      );
    })
  );


  constructor(
    private cdRef: ChangeDetectorRef,
    private discipleshipService: DiscipleshipService,
    private notificationService: NotificationService,
  ) { }


  ionViewWillEnter(): void {
    this.triggerLoad.next(false);
  }

  doRefresh(event: any): void {
    setTimeout(() => {
      this.triggerLoad.next(false);
      event.target.complete();
    }, 500);
  }

  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }

  transformDiscipleship(discipleship: Discipleships): { id: string, verses: string[] }[] {
    return Object.entries(discipleship || {})?.reduce((acc, item): any => {
      const [ id, verses ] = item || {};
      return [
        ...acc,
        ...(id && verses
            ? [
                {
                  id,
                  verses
                }
              ]
            : []
          )
      ]
    },[]);
  }


}
