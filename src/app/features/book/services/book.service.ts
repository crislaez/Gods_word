import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HEADERS } from '@godsWord/core/constants/generic.constants';
import { ENVIRONMENT, Environment } from '@godsWord/core/environments/environment.token';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { Book, BookResponse } from '../models/book.models';
import { BOOKS } from '../utils/book.utils';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private baseURL: string = this.env.baseEndpoint;
  private apiKey: string = this.env.apiKey;
  private booksCache$ = new BehaviorSubject<Book[]>([])


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  getAll(reload: boolean = false): Observable<Book[]> {
    if(!reload && this.booksCache$.value?.length > 0){
      return of(this.booksCache$.value)
    }

    const url = `${this.baseURL}bible/contents/RVR60.js?culture=es&key=${this.apiKey}`;

    return this.http.get<BookResponse>(url,{ headers: HEADERS }).pipe(
      map((response) => {
        const { books = []} = response || {};
        const bookFormat = books?.map(({passage, chapters}) => ({
          passage: (BOOKS as any)?.[passage] || passage,
          chapters
        }));
        this.booksCache$.next(bookFormat);
        return bookFormat;
      }),
      catchError((error) => throwError(() => error))
    )
  }


}
