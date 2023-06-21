import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HEADERS } from '@godsWord/core/constants/generic.constants';
import { ENVIRONMENT, Environment } from '@godsWord/core/environments/environment.token';
import { GenericObj } from '@godsWord/core/models/generic.models';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { VerseResponse } from '../models/verse.models';

@Injectable({
  providedIn: 'root'
})
export class VerseService {

  private baseURL: string = this.env.baseEndpoint;
  private apiKey: string = this.env.apiKey;
  private versesCache$ = new BehaviorSubject<GenericObj<string[]>>(null!);
  private versesOfDayCache$ = new BehaviorSubject<GenericObj<string>>(null!);
  private searchVerse$ = new BehaviorSubject<{[searchKey: string]: string}>(null!)


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  getByPassage(chapter: string, reload: boolean = false): Observable<string[]> {
    if(!reload && this.versesCache$.value?.[chapter]?.length > 0){
      return of(this.versesCache$.value?.[chapter]);
    }

    const url = `${this.baseURL}bible/content/RVR60.js?passage=${chapter}&style=orationOneVersePerLine&key=${this.apiKey}`;

    return this.http.get<VerseResponse>(url,{ headers: HEADERS }).pipe(
      map((response) => {
        const { text } = response || {};
        const testFormat = text?.split(/\r\n|\r|\n/) || [];
        const [ _, ...allverses ] = testFormat;

        this.versesCache$.next({
          ...this.versesCache$.value,
          [chapter]: allverses
        });

        return allverses;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  getVersesOfDay(name: string, reload: boolean = false): Observable<any> {
    if(!reload && this.versesOfDayCache$?.value?.[name]){
      return of(this.versesOfDayCache$?.value?.[name]);
    }

    const url = `${this.baseURL}bible/content/RVR60.js?passage=${name}&style=orationOneVersePerLine&key=${this.apiKey}`;

    return this.http.get<VerseResponse>(url,{ headers: HEADERS }).pipe(
      map((response) => {
        const { text = null } = response || {};

        this.versesOfDayCache$.next({
          ...this.versesOfDayCache$.value,
          [name]: text!
        });

        return text
      }),
      catchError((error) => throwError(() => error))
    )
  };

  getSearch(search: string): Observable<any> {
    if(this.searchVerse$?.value?.[search]){
      return of(this.searchVerse$?.value?.[search])
    }

    return this.http.get<any>(`${this.baseURL}bible/search/RVR60.js?query=${search}&key=${this.apiKey}`,{ headers: HEADERS }).pipe(
      map(response => {
        const {results = null} = response || {};
        const [ firstItem ] = results || [];

        this.searchVerse$.next({
          ...(this.searchVerse$.value ?? {}),
          [search]: firstItem
        });

        return firstItem || {};
      }),
      catchError((error) => throwError(() => error))
    )
  };


}
