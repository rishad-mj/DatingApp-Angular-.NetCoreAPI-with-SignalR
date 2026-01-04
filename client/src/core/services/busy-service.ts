import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  
  busyRequestCount = signal(0);

 busy(){
    this.busyRequestCount.update(cur=>cur+1);
 }
  
 idle(){
  this.busyRequestCount.update(cur=> Math.max(0,cur-1));
 }
}
