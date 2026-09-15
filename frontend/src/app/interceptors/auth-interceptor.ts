import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  console.log(
    'AUTH INTERCEPTOR:',
    token ? 'JWT FOUND' : 'NO JWT'
  );

  // No token → send request normally
  if (!token) {
    return next(req);
  }

  // Add JWT Authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log(
    'AUTH INTERCEPTOR: Authorization header added'
  );

  return next(authReq);
};
