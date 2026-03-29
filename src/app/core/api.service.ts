import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  get<T>(key: string): Observable<T[]> {
    const raw = localStorage.getItem(key);
    const data: T[] = raw ? (JSON.parse(raw) as T[]) : [];
    return of(data);
  }

  post<T>(key: string, item: T): Observable<T> {
    const raw = localStorage.getItem(key);
    const data: T[] = raw ? (JSON.parse(raw) as T[]) : [];
    data.push(item);
    localStorage.setItem(key, JSON.stringify(data));
    return of(item);
  }

  put<T>(key: string, items: T[]): Observable<T[]> {
    localStorage.setItem(key, JSON.stringify(items));
    return of(items);
  }

  delete<T extends { id: string }>(key: string, id: string): Observable<void> {
    const raw = localStorage.getItem(key);
    const data: T[] = raw ? (JSON.parse(raw) as T[]) : [];
    localStorage.setItem(key, JSON.stringify(data.filter((item) => item.id !== id)));
    return of(void 0);
  }
}
