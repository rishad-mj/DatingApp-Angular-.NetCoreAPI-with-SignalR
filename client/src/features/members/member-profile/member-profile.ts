import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';
import { Member } from '../../../Types/member';
import { AccountService } from '../../../core/services/account-service';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule, TimeAgoPipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['$event']) notify($event: BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault();
    }
  }
  protected memberservice = inject(MemberService);
  private accountService = inject(AccountService);

  private toast = inject(ToastService);
  protected editableMember = {
    displayName: '',
    description: '',
    city: '',
    country: '',
  };

  ngOnInit() {
    this.editableMember = {
      displayName: this.memberservice.member()?.displayName || '',
      description: this.memberservice.member()?.description || '',
      city: this.memberservice.member()?.city || '',
      country: this.memberservice.member()?.country || '',
    };
  }

  ngOnDestroy(): void {
    if (this.memberservice.editMode()) {
      this.memberservice.editMode.set(false);
    }
  }



  updateProfile() {
    if (!this.memberservice.member()) return;
    const updatedMemeber = { ...this.memberservice.member(), ...this.editableMember };
    this.memberservice.updateMember(this.editableMember).subscribe({
      next: () => {
        const currentUser = this.accountService.currentUser();
        if (currentUser && updatedMemeber.displayName !== currentUser?.displayName) {
          currentUser.displayName = updatedMemeber.displayName;
        }
        this.toast.success('Profile updated successfully');
        this.memberservice.editMode.set(false);
        this.memberservice.member.set(updatedMemeber as Member);
        this.editForm?.reset(updatedMemeber);
      },
    });
  }
}
