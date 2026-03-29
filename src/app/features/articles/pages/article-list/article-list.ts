import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.html',
  styleUrls: ['./article-list.scss'],
})
export class ArticleList {
  private articleService = inject(ArticleService);
  private router = inject(Router);

  readonly articles = this.articleService.articles;

  constructor() {
    effect(() => {
      this.articleService.load();
    });
  }

  create(): void {
    this.router.navigate(['/articles/new']);
  }

  open(id: string): void {
    this.router.navigate(['/articles', id]);
  }

  delete(id: string): void {
    this.articleService.delete(id);
  }
}
