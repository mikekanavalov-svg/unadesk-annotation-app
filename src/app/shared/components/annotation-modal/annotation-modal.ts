import { Component, HostListener, output, signal } from '@angular/core';

@Component({
  selector: 'app-annotation-modal',
  standalone: true,
  templateUrl: './annotation-modal.html',
  styleUrls: ['./annotation-modal.scss'],
})
export class AnnotationModal {
  colors = ['yellow', 'red', 'green', 'lightblue', 'gray'];

  note = signal('');
  selectedColor = signal('yellow');

  save = output<{ note: string; color: string }>();
  closed = output<void>();

  selectColor(color: string) {
    this.selectedColor.set(color);
  }

  onSave() {
    this.save.emit({
      note: this.note(),
      color: this.selectedColor(),
    });
  }

  onCancel() {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closed.emit();
  }
}
