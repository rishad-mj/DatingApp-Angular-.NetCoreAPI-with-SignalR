import { Component, inject, signal } from '@angular/core';
import { LikesService } from '../../core/services/likes-service';
import { Member } from '../../Types/member';
import { MemberCard } from '../members/member-card/member-card';
import { PaginatedResult } from '../../Types/pagination';
import { Paginator } from "../../shared/paginator/paginator";

@Component({
  selector: 'app-lists',
  imports: [MemberCard, Paginator],
  templateUrl: './lists.html',
  styleUrl: './lists.css',
})
export class Lists {
  private likesService = inject(LikesService);
  protected predicate = 'liked';
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
  protected pageNumber: number = 1;
  protected pageSize: number = 5;
  protected hasOnlyOnePage: boolean = false;

  tabs = [
    { label: 'Liked Me', value: 'likedBy' },
    { label: 'Liked', value: 'liked' },
    { label: 'Mutual', value: 'mutual' },
  ];

  ngOnInit() {
    this.loadLikes();
  }

  onPageChange($event: { pageNumber: number; pageSize: number; hasOnlyOnePage: boolean }) {
    this.pageNumber = $event.pageNumber;
    this.pageSize = $event.pageSize;
    this.loadLikes();
  }

  setPredicate(predicate: string) {
    if (this.predicate === predicate) return;
    this.predicate = predicate;
     this.pageNumber = 1;
    this.loadLikes();
  }

  loadLikes() {
    this.likesService.getLikes(this.predicate,this.pageNumber,this.pageSize).subscribe({
      next: (members) => {
        this.paginatedMembers.set(members);
      },
    });
  }
}
