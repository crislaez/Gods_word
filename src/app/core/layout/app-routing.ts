import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('../../views/home/home-routing').then(m => m.routes),
  },
  {
    path: 'book',
    children: [
      {
        path: ':bookName',
        loadChildren: () => import('../../views/book/book-routing').then(m => m.routes),
      },
      {
        path: '**',
        redirectTo: '/home',
      }
    ]
  },
  {
    path: 'books',
    loadChildren: () => import('../../views/books/books-routing').then(m => m.routes),
  },
  {
    path: 'storage',
    loadChildren: () => import('../../views/storage/storage-routing').then(m => m.routes),
  },
  {
    path: 'discipleship',
    loadChildren: () => import('../../views/discipleship/discipleship-routing').then(m => m.routes),
  },
  {
    path: 'search',
    loadChildren: () => import('../../views/search/search-routing').then(m => m.routes),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  }
];

