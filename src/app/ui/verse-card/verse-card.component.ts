import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { sliceText } from '@godsWord/core/functions/generic.functions';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-verse-card',
  template: `
  <ion-card
    class="displays-center cb-light"
    [ngStyle]="{ 'min-height': height, 'width': width , 'background': imgBackground }"
  >

    <div class="w-100"
      [ngClass]="{'displays-end': !showChapter, 'displays-between': showChapter}">
      <div *ngIf="showChapter">{{ chapter }}</div>

      <ion-icon name="ellipsis-horizontal-outline" class="fs-33"
        *ngIf="showActtionButton"
        (click)="onClick.next({event: $event, chapter: this.chapter, verse: this.verse })">
      </ion-icon>
    </div>

    <div class="displays-start tc-sixtiary" [innerHTML]="title">
    </div>

  </ion-card>
  `,
  styleUrls: ['./verse-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerseCardComponent {

  sliceText = sliceText;
  @Input() verse!: string;
  @Input() chapter!: string;
  @Input() showChapter: boolean = false;
  @Input() showActtionButton: boolean = true;
  @Input() width: string = '96%';
  @Input() height: string = '6em';
  @Input() imgBackground: string = '#FAFAFA';
  @Output() onClick = new EventEmitter<{ event: any, chapter: string, verse: string }>();


  get title(){
    const [ passageNumber, ...restPassage ] = this.verse?.split(' ');
    return `<p><span class="fw-bold">${passageNumber}: </span>${restPassage?.join(' ')}</p>`;
  }

}
