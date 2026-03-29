import { Injectable } from '@angular/core';
import { Annotation, ResolvedAnnotation } from '../../../shared/models/annotation.model';

const CONTEXT_LENGTH = 32;

@Injectable({ providedIn: 'root' })
export class AnnotationAnchorService {
  buildAnchor(
    articleText: string,
    range: { start: number; end: number },
  ): Pick<Annotation, 'start' | 'end' | 'selectedText' | 'prefix' | 'suffix'> {
    return {
      selectedText: articleText.slice(range.start, range.end),
      start: range.start,
      end: range.end,
      prefix: articleText.slice(Math.max(0, range.start - CONTEXT_LENGTH), range.start),
      suffix: articleText.slice(range.end, range.end + CONTEXT_LENGTH),
    };
  }

  resolve(articleText: string, annotation: Annotation): ResolvedAnnotation | null {
    const { selectedText, prefix, suffix } = annotation;

    const occurrences = this.findAllOccurrences(articleText, selectedText);

    if (occurrences.length === 0) {
      return null;
    }

    const bestStart =
      occurrences.length === 1
        ? occurrences[0]
        : this.pickBestOccurrence(articleText, occurrences, selectedText.length, prefix, suffix);

    return {
      ...annotation,
      resolvedStart: bestStart,
      resolvedEnd: bestStart + selectedText.length,
    };
  }

  private findAllOccurrences(text: string, search: string): number[] {
    const result: number[] = [];
    let idx = text.indexOf(search);
    while (idx !== -1) {
      result.push(idx);
      idx = text.indexOf(search, idx + 1);
    }
    return result;
  }

  private pickBestOccurrence(
    text: string,
    occurrences: number[],
    selectedLength: number,
    storedPrefix: string,
    storedSuffix: string,
  ): number {
    let bestIdx = occurrences[0];
    let bestScore = -1;

    for (const pos of occurrences) {
      const actualPrefix = text.slice(Math.max(0, pos - CONTEXT_LENGTH), pos);
      const actualSuffix = text.slice(pos + selectedLength, pos + selectedLength + CONTEXT_LENGTH);
      const score =
        this.similarityScore(actualPrefix, storedPrefix) +
        this.similarityScore(actualSuffix, storedSuffix);

      if (score > bestScore) {
        bestScore = score;
        bestIdx = pos;
      }
    }

    return bestIdx;
  }

  private similarityScore(a: string, b: string): number {
    if (!a.length || !b.length) return 0;
    const len = Math.max(a.length, b.length);
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    return matches / len;
  }
}
