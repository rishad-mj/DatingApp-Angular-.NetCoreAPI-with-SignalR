import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { MemberService } from '../../../core/services/member-service';
import { Member, MemberParams } from '../../../Types/member';
import { MemberCard } from '../member-card/member-card';
import { PaginatedResult } from '../../../Types/pagination';
import { Paginator } from '../../../shared/paginator/paginator';
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator, FilterModal],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal;
  private memberService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);

  memberParams = new MemberParams();
  private updatedParams = new MemberParams();

  ngOnInit() {
    const filter = JSON.parse(localStorage.getItem('filter') || '{}') || new MemberParams();
    if (filter && Object.keys(filter).length > 0) {
      this.memberParams = filter;
      this.updatedParams = filter;
    }
    this.loadMembers();
  }

  onPageChange($event: { pageNumber: number; pageSize: number }) {
    this.memberParams.pageNumber = $event.pageNumber;
    this.memberParams.pageSize = $event.pageSize;
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.memberParams).subscribe({
      next: (members) => {
        this.paginatedMembers.set(members);
      },
      error: (err) => {
        console.error('Error loading members:', err);
      },
    });
  }

  openModal() {
    this.modal.open();
  }
  onCloseFilterModal() {
    // Handle any actions needed when the modal is closed
  }
  onFilterChange(memberParams: MemberParams) {
    this.memberParams = {...memberParams};
    this.updatedParams = {...memberParams};
    this.loadMembers();
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    this.updatedParams = new MemberParams();
    localStorage.removeItem('filter');
    this.loadMembers();
  }

  get displayMessage(): string {
    const defaultParams = new MemberParams();

    const filters: string[] = [];

    if (this.updatedParams.gender) {
      filters.push(this.updatedParams.gender + 's');
    } else {
      filters.push('Males, Females');
    }

    if (
      this.updatedParams.minAge !== defaultParams.minAge ||
      this.updatedParams.maxAge !== defaultParams.maxAge
    ) {
      filters.push(` ages ${this.updatedParams.minAge}-${this.updatedParams.maxAge}`);
    }

    filters.push(
      this.updatedParams.orderBy === 'lastActive' ? 'Recently active' : 'Newest members'
    );

    return filters.length > 0 ? `Selected: ${filters.join('  | ')}` : 'All members';
  }
}
