import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReturnStatement } from '@angular/compiler';
import { Member } from '../../Types/member';
import { PaginatedResult, Pagination } from '../../Types/pagination';

@Injectable({
  providedIn: 'root',
})
export class LikesService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<string[]>([]);

  toggleLike(targetMemberId: string) {
    return this.http.post(`${this.baseUrl}likes/${targetMemberId}`, {}).subscribe({
      next: () => {
        if (this.likeIds().includes(targetMemberId)) {
          this.likeIds.update((ids) => ids.filter((x) => x !== targetMemberId));
        } else {
          this.likeIds.update((ids) => [...ids, targetMemberId]);
        }
      },
    });
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    params = params.append('predicate', predicate);
    return this.http.get<PaginatedResult<Member>>(`${this.baseUrl}likes`, { params });
  }

  getLikeIds() {
    return this.http.get<string[]>(`${this.baseUrl}likes/list`).subscribe({
      next: (data) => {
        this.likeIds.set(data);
      },
    });
  }

  clearLikeIds() {
    this.likeIds.set([]);
  }
}
