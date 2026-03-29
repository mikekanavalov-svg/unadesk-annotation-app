import {
  AfterViewChecked,
  Component,
  effect,
  ElementRef,
  inject,
  NgZone,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../../../shared/models/article.model';
import { AnnotationService } from '../../../annotations/services/annotation.service';
import { AnnotationAnchorService } from '../../../annotations/services/annotation-anchor.service';
import { AnnotationModal } from '../../../../shared/components/annotation-modal/annotation-modal';
import { SelectionRange } from '../../../../shared/models/selection-range.model';
import { AnnotationTooltip } from '../../../../shared/components/annotation-tooltip/annotation-tooltip';
import { buildAnnotatedHtml } from '../../lib/article-renderer';
import { getSelectionOffsets } from '../../lib/selection';

interface TooltipState {
  annotationId: string;
  note: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-article-viewer',
  imports: [AnnotationModal, AnnotationTooltip],
  templateUrl: './article-viewer.html',
  styleUrls: ['./article-viewer.scss'],
})
export class ArticleViewer implements AfterViewChecked {
  @ViewChild('textContainer', { static: false })
  private textContainer?: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly annotationService = inject(AnnotationService);
  private readonly annotationAnchorService = inject(AnnotationAnchorService);
  private readonly ngZone = inject(NgZone);

  private selectedRange: SelectionRange | null = null;
  private needsRender = false;
  private hideTooltipTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly HIDE_DELAY_MS = 200;

  readonly article = signal<Article | null>(null);
  readonly title = signal('');
  readonly content = signal('');
  readonly mode = signal<'view' | 'edit' | 'create'>('view');
  readonly modalOpen = signal(false);
  readonly tooltip = signal<TooltipState | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    const isCreateRoute = this.route.snapshot.routeConfig?.path === 'articles/new';

    if (isCreateRoute) {
      this.mode.set('create');
      return;
    }

    if (id) {
      this.articleService.load();
      this.annotationService.load(id);

      effect(() => {
        const article = this.articleService.articles().find((a) => a.id === id);
        if (!article) return;

        this.article.set(article);
        this.title.set(article.title);
        this.content.set(article.content);
        this.mode.set('view');
      });
    }

    effect(() => {
      this.article();
      this.annotationService.annotations();
      this.needsRender = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.needsRender && this.textContainer?.nativeElement) {
      this.needsRender = false;
      this.renderAnnotatedText();
    }
  }

  private renderAnnotatedText(): void {
    const root = this.textContainer?.nativeElement;
    const article = this.article();
    if (!root || !article) return;
    const resolved = this.annotationService.resolveAll(article.content);
    root.innerHTML = buildAnnotatedHtml(article.content, resolved);
  }

  onContainerMouseover(event: MouseEvent): void {
    const mark = (event.target as HTMLElement).closest<HTMLElement>('mark[data-annotation-id]');
    if (!mark) return;
    this.cancelHideTooltip();
    this.showTooltipForMark(mark);
  }

  onContainerMouseout(event: MouseEvent): void {
    const related = event.relatedTarget as HTMLElement | null;
    if (related?.closest('mark[data-annotation-id]')) return;
    if (related?.closest('.annotation-tooltip')) return;
    this.scheduleHideTooltip();
  }

  onTooltipMouseenter(): void {
    this.cancelHideTooltip();
  }

  onTooltipMouseleave(): void {
    this.scheduleHideTooltip();
  }

  private showTooltipForMark(mark: HTMLElement): void {
    const id = mark.dataset['annotationId']!;
    if (!id) return;
    const note = mark.dataset['note'] ?? '';
    const rect = mark.getBoundingClientRect();

    this.tooltip.set({
      annotationId: id,
      note,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  private scheduleHideTooltip(): void {
    this.ngZone.runOutsideAngular(() => {
      this.hideTooltipTimer = setTimeout(() => {
        this.ngZone.run(() => this.tooltip.set(null));
      }, this.HIDE_DELAY_MS);
    });
  }

  private cancelHideTooltip(): void {
    if (this.hideTooltipTimer !== null) {
      clearTimeout(this.hideTooltipTimer);
      this.hideTooltipTimer = null;
    }
  }

  onContainerFocus(event: FocusEvent): void {
    const mark = (event.target as HTMLElement).closest<HTMLElement>('mark[data-annotation-id]');
    if (!mark) return;
    this.cancelHideTooltip();
    this.showTooltipForMark(mark);
  }

  onContainerBlur(): void {
    this.scheduleHideTooltip();
  }

  onContainerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const mark = (event.target as HTMLElement).closest<HTMLElement>('mark[data-annotation-id]');
    if (mark) this.showTooltipForMark(mark);
  }

  closeTooltip(): void {
    this.tooltip.set(null);
  }

  onDeleteAnnotation(id: string): void {
    this.annotationService.remove(id);
    this.tooltip.set(null);
  }

  onTextSelection(): void {
    if (this.mode() !== 'view') return;
    const selection = window.getSelection();
    const root = this.textContainer?.nativeElement;
    if (!selection || !root) return;
    const offsets = getSelectionOffsets(root, selection);
    if (!offsets) return;
    const article = this.article();
    if (!article) return;
    const slice = article.content.slice(offsets.start, offsets.end);
    if (slice !== offsets.text) {
      console.warn('[Selection mismatch]', offsets);
      selection.removeAllRanges();
      return;
    }

    this.selectedRange = {
      start: offsets.start,
      end: offsets.end,
      selectedText: offsets.text,
    };

    this.tooltip.set(null);
    this.modalOpen.set(true);
    selection.removeAllRanges();
  }

  onTitleInput(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  onContentInput(event: Event): void {
    this.content.set((event.target as HTMLTextAreaElement).value);
  }

  save(): void {
    const title = this.title();
    const content = this.content();

    if (this.mode() === 'create') {
      this.articleService.create({ id: crypto.randomUUID(), title, content });
      this.router.navigate(['/articles']);
      return;
    }

    if (this.mode() === 'edit') {
      const current = this.article();
      if (!current) return;

      const updated: Article = { ...current, title, content };
      this.articleService.update(updated);
      this.article.set(updated);
      this.mode.set('view');
    }
  }

  goBack(): void {
    if (this.mode() === 'edit') {
      this.mode.set('view');
      return;
    }
    this.router.navigate(['/articles']);
  }

  enterEdit(): void {
    this.mode.set('edit');
  }

  onModalSave(data: { note: string; color: string }): void {
    if (!this.selectedRange) return;

    const article = this.article();
    if (!article) return;

    const anchor = this.annotationAnchorService.buildAnchor(article.content, {
      start: this.selectedRange.start,
      end: this.selectedRange.end,
    });

    const annotation = {
      id: crypto.randomUUID(),
      articleId: article.id,
      note: data.note,
      color: data.color,
      ...anchor,
    };

    this.annotationService.add(annotation);

    this.modalOpen.set(false);
    this.selectedRange = null;
  }

  onModalCancel(): void {
    this.modalOpen.set(false);
    this.selectedRange = null;
  }
}
