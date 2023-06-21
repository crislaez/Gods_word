import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Discipleships } from '../models/discipleship.models';
import { DISCIPLESHIP } from '../utils/discipleship';

@Injectable({
  providedIn: 'root'
})
export class DiscipleshipService {


  constructor() { }


  getAll(reload: boolean = false): Observable<Discipleships>{
    return of(DISCIPLESHIP)
    // .pipe(
    //   delay(1000)
    // )
  }


}

