import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'articles',
    pathMatch: 'full',
  },
  {
    path: 'articles',
    loadComponent: () =>
      import('./features/articles/pages/article-list/article-list').then((m) => m.ArticleList),
  },
  {
    path: 'articles/new',
    loadComponent: () =>
      import('./features/articles/pages/article-viewer/article-viewer').then(
        (m) => m.ArticleViewer,
      ),
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('./features/articles/pages/article-viewer/article-viewer').then(
        (m) => m.ArticleViewer,
      ),
  },
  {
    path: '**',
    redirectTo: 'articles',
  },
];
