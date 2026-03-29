export interface Annotation {
  id: string;
  articleId: string;
  start: number;
  end: number;
  selectedText: string;
  prefix: string;
  suffix: string;
  note: string;
  color: string;
}

export interface ResolvedAnnotation extends Annotation {
  resolvedStart: number;
  resolvedEnd: number;
}
