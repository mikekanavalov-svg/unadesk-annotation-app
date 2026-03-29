export interface SelectionOffsets {
  start: number;
  end: number;
  text: string;
}

export function getSelectionOffsets(
  root: HTMLElement,
  selection: Selection,
): SelectionOffsets | null {
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);

  if (!root.contains(range.commonAncestorContainer)) return null;

  const text = range.toString();
  if (!text.trim()) return null;

  const preRange = document.createRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.startContainer, range.startOffset);

  const start = preRange.toString().length;
  const end = start + text.length;

  return { start, end, text };
}
