import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account-service';
import { ToastService } from '../services/toast-service';

export const adminGuard: CanActivateFn = (route, state) => {

  const accountService = inject(AccountService);
  const toast = inject(ToastService);
  console.log(accountService.currentUser());
  if (
    accountService.currentUser()?.roles.includes('Admin') ||
    accountService.currentUser()?.roles.includes('Moderator')
  ) {
    console.log('Admin guard passed');
    return true;
  } else {
     console.log('Admin guard failed');
    toast.error('You are not authorized to access this page');
    return false;
  }
};
