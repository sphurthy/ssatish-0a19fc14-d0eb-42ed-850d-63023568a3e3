import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Add withCredentials to all requests to send cookies
  const clonedReq = req.clone({
    withCredentials: true,
  });

  return next(clonedReq);
};
