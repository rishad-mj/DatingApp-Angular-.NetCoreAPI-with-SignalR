import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService } from '../../../core/services/member-service';
import { Member, Photo } from '../../../Types/member';
import { AsyncPipe } from '@angular/common';
import { ImageUpload } from '../../../shared/image-upload/image-upload';
import { AccountService } from '../../../core/services/account-service';
import { User } from '../../../Types/user';
import { StarButton } from '../../../shared/star-button/star-button';
import { DeleteButton } from '../../../shared/delete-button/delete-button';

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload, StarButton, DeleteButton],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  private route = inject(ActivatedRoute);
  protected member = inject(MemberService);
  protected accountService = inject(AccountService);
  protected photos = signal<Photo[]>([]);
  protected loading = signal(false);

  ngOnInit(): void {
    const memberid = this.route.parent?.snapshot.paramMap.get('id');
    if (memberid) {
      this.member.getMemberPhotos(memberid).subscribe({
        next: (photos) => this.photos.set(photos),
      });
    }
  }

  onUploadImage(file: File) {
    this.loading.set(true);
    this.member.uploadPhoto(file).subscribe({
      next: (photo) => {
        this.member.editMode.set(false);
        this.loading.set(false);
        this.photos.update((photos) => [...photos, photo]);

        if (!this.member.member()?.imageUrl) {
          this.setLocalPhoto(photo);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  setMainPhoto(photo: Photo) {
    this.member.setMainPhoto(photo).subscribe({
      next: () => {
        this.setLocalPhoto(photo);
      },
    });
  }

  deletePhoto(photoid: number) {
    this.member.deletePhoto(photoid).subscribe({
      next: () => {
        this.photos.update((p) => p.filter((x) => x.id !== photoid));
      },
    });
  }

  setLocalPhoto(photo: Photo) {
    const curUser = this.accountService.currentUser();
    if (curUser) curUser.imageUrl = photo.url;
    this.accountService.setCurrentUser(curUser as User);

    this.member.member.update(
      (mem) =>
        ({
          ...mem,
          imageUrl: photo.url,
        } as Member)
    );
  }
}
