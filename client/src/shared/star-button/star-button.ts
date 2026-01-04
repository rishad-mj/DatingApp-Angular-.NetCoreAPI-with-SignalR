import { Component, EventEmitter, input, output, Output } from '@angular/core';

@Component({
  selector: 'app-star-button',
  imports: [],
  templateUrl: './star-button.html',
  styleUrl: './star-button.css',
})
export class StarButton {

  disabled = input<boolean>(false);
  selected = input<boolean>(false);
  clickEvent = output<Event>();

  setMainPhoto(event: Event) {
    this.clickEvent.emit(event);
  }
}
