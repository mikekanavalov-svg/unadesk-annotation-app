import { Injectable, signal, inject } from '@angular/core';
import { Article } from '../../../shared/models/article.model';
import { ApiService } from '../../../core/api.service';
import { StorageKeys } from '../../../core/storage-keys.enum';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private api = inject(ApiService);

  private _articles = signal<Article[]>([]);
  readonly articles = this._articles.asReadonly();

  load() {
    this.api.get<Article>(StorageKeys.Articles).subscribe((data) => {
      this._articles.set(data);
    });
  }

  getById(id: string): Article | undefined {
    return this._articles().find((a) => a.id === id);
  }

  create(article: Article) {
    this.api.post<Article>(StorageKeys.Articles, article).subscribe((newItem) => {
      this._articles.update((list) => [...list, newItem]);
    });
  }

  update(updated: Article) {
    const current = this._articles();
    const updatedList = current.map((a) => (a.id === updated.id ? updated : a));

    this.api.put<Article>(StorageKeys.Articles, updatedList).subscribe(() => {
      this._articles.set(updatedList);
    });
  }

  delete(id: string) {
    this.api.delete<Article>(StorageKeys.Articles, id).subscribe(() => {
      this._articles.update((list) => list.filter((a) => a.id !== id));
    });
  }
}
