import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-skeleton-card',
  template:`
  <ion-card class="slide-ion-card" >

    <div class="mat-card-header">
      <div class="div-image"></div>
    </div>

    <!-- <div class="card-content">
      <div class="div-p"></div>
    </div> -->
  </ion-card>
  `,
  styleUrls: ['./skeleton-card.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonCardComponent {

}
