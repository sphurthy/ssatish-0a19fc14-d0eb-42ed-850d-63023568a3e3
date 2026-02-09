import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An error occurred';

      if (error.status === 403) {
        message = 'Permission denied. You do not have access to perform this action.';
      } else if (error.status === 401) {
        message = 'Authentication required. Please login again.';
      } else if (error.status === 500) {
        message = 'Server error. Please try again later.';
      } else if (error.status === 400) {
        message = error.error?.message || 'Invalid request. Please check your input.';
      } else if (error.status === 404) {
        message = 'Resource not found.';
      } else if (error.error?.message) {
        message = error.error.message;
      }

      toastService.error(message);
      return throwError(() => error);
    })
  );
};
