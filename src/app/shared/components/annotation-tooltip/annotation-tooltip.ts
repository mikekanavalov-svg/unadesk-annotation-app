import { Component, input, output } from '@angular/core';

export interface TooltipState {
  annotationId: string;
  note: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-annotation-tooltip',
  standalone: true,
  templateUrl: './annotation-tooltip.html',
  styleUrls: ['./annotation-tooltip.scss'],
})
export class AnnotationTooltip {
  readonly tooltip = input<TooltipState | null>(null);

  readonly closed = output<void>();
  readonly deleted = output<string>();

  onDelete(): void {
    const t = this.tooltip();
    if (!t) return;
    this.deleted.emit(t.annotationId);
  }

  onMouseLeave(): void {
    this.closed.emit();
  }
}
