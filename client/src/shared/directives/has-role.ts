import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../../core/services/account-service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRole implements OnInit {
  @Input() appHasRole: string[] = [];

private accountservice =inject(AccountService);
private  viewContainerRef = inject(ViewContainerRef);
private templateRef = inject(TemplateRef);

ngOnInit() {
  this.accountservice.currentUser()?.roles?.some(roles => this.appHasRole?.includes(roles)) ? this.viewContainerRef.createEmbeddedView(this.templateRef) : this.viewContainerRef.clear(); // if user has role, render template, else clear it 
}

}
