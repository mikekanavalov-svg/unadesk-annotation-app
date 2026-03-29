export interface ResolvedAnnotation {
  id: string;
  note: string;
  color: string;
  resolvedStart: number;
  resolvedEnd: number;
}

export function buildAnnotatedHtml(
  text: string,
  annotations: readonly ResolvedAnnotation[],
): string {
  const sorted = [...annotations].sort((a, b) => a.resolvedStart - b.resolvedStart);

  let html = '';
  let cursor = 0;

  for (const annotation of sorted) {
    if (annotation.resolvedStart < cursor) continue;

    if (cursor < annotation.resolvedStart) {
      html += escapeHtml(text.slice(cursor, annotation.resolvedStart));
    }

    const escapedText = escapeHtml(text.slice(annotation.resolvedStart, annotation.resolvedEnd));

    const escapedNote = escapeAttr(annotation.note);

    html +=
      `<mark tabindex="0"` +
      ` class="annotation"` +
      ` data-annotation-id="${annotation.id}"` +
      ` data-note="${escapedNote}"` +
      ` style="text-decoration: underline ${annotation.color} 2px; background: transparent"` +
      `>${escapedText}</mark>`;

    cursor = annotation.resolvedEnd;
  }

  if (cursor < text.length) {
    html += escapeHtml(text.slice(cursor));
  }

  return html;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
