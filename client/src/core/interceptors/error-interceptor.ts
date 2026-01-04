import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error) {
        switch (error.status) {
          case 400:
            const errors = error.error?.errors;
            // Case 1: errors is an object like { Email: [], Password: [] }
            if (errors) {
              const modelStateErrors: any[] = [];
              Object.keys(errors).forEach((key) => {
                const arr = errors[key];
                if (Array.isArray(arr)) {
                  arr.forEach((msg) => modelStateErrors.push(msg));
                }
              });
              throw modelStateErrors.flat();
            } 
            else {toast.error(error.error);}
            break;
          case 401:
            toast.error('Unauthorized');
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras = { state: { error: error.error } };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          case 503:
            toast.error('Server error');
            break;
          default:
            toast.error('Something unexpected went wrong');
            console.log(error);
            break;
        }
        console.error('Error intercepted:', error);
        throw error;
      }
      throw error;
    })
  );
};
