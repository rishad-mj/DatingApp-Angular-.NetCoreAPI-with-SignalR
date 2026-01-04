import { Component, ElementRef, model, OnInit, output, signal, ViewChild, viewChild } from '@angular/core';
import { MemberParams } from '../../../Types/member';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-modal',
  imports: [FormsModule],
  templateUrl: './filter-modal.html',
  styleUrl: './filter-modal.css',
})
export class FilterModal {

  @ViewChild('filterModal') modalRef!: ElementRef<HTMLDialogElement>;
  closeModal = output();
  submitData = output<MemberParams>();
  memberParams = model(new MemberParams());

  constructor() {

    const filter = JSON.parse(localStorage.getItem('filter') || '{}') || new MemberParams();
    if (filter && Object.keys(filter).length > 0) {
      this.memberParams.set(filter);
    }
  }
  open() {

    this.modalRef.nativeElement.showModal();
  }

  close() {
    this.modalRef.nativeElement.close();
    this.closeModal.emit();
  }

  submit() {
    this.submitData.emit(this.memberParams());
    localStorage.setItem('filter', JSON.stringify(this.memberParams()));
    this.close();
  }
  onMinAgeChange() {
    if (this.memberParams().minAge < 18) this.memberParams().minAge = 18;
  }

  onMaxAgeChange() {
    if (this.memberParams().maxAge < this.memberParams().minAge) {
      this.memberParams().maxAge = this.memberParams().minAge;
    }
  }
}
