import { inject, Injectable, signal } from '@angular/core';
import { Annotation, ResolvedAnnotation } from '../../../shared/models/annotation.model';
import { ApiService } from '../../../core/api.service';
import { StorageKeys } from '../../../core/storage-keys.enum';
import { AnnotationAnchorService } from './annotation-anchor.service';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private readonly api = inject(ApiService);
  private readonly anchor = inject(AnnotationAnchorService);

  private readonly _annotations = signal<Annotation[]>([]);
  readonly annotations = this._annotations.asReadonly();

  load(articleId: string): void {
    this.api.get<Annotation>(StorageKeys.Annotations).subscribe((data) => {
      this._annotations.set(data.filter((a) => a.articleId === articleId));
    });
  }

  add(annotation: Annotation): void {
    this.api.post<Annotation>(StorageKeys.Annotations, annotation).subscribe((newItem) => {
      this._annotations.update((list) => [...list, newItem]);
    });
  }

  remove(id: string): void {
    this.api.delete<Annotation>(StorageKeys.Annotations, id).subscribe(() => {
      this._annotations.update((list) => list.filter((a) => a.id !== id));
    });
  }

  resolveAll(articleText: string): ResolvedAnnotation[] {
    const resolved: ResolvedAnnotation[] = [];
    const lost: string[] = [];

    for (const annotation of this._annotations()) {
      const result = this.anchor.resolve(articleText, annotation);
      if (result) {
        resolved.push(result);
      } else {
        lost.push(annotation.id);
      }
    }

    if (lost.length > 0) {
      lost.forEach((id) => this.remove(id));
    }

    return resolved;
  }
}
