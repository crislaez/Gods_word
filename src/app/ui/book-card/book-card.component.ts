import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { sliceText } from '@godsWord/core/functions/generic.functions';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-book-card',
  template: `
  <ion-card
    class="ion-activatable ripple-parent displays-center cb-light"
    [ngStyle]="{ 'height': height, 'width': width , 'background': imgBackground }"
    (click)="onClick.next(verse)">

    <div class="displays-center fw-bold tc-sixtiary">{{ sliceText(verse) }}</div>

    <!-- RIPLE EFFECT  -->
    <ion-ripple-effect></ion-ripple-effect>
  </ion-card>
  `,
  styleUrls: ['./book-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookCardComponent {
  sliceText = sliceText;
  @Input() verse!: string;
  @Input() width: string = '96%';
  @Input() height: string = '6em';
  @Input() imgBackground: string = '#FAFAFA';
  @Output() onClick = new EventEmitter<string>();

}
