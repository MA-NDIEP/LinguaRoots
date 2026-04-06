import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  console.log("Interceptor triggered");
  console.log("Token:", token);

  // 1. Check if the request is for login or register
  const isLoginRequest = req.url.includes('/login');
  const isRegisterRequest = req.url.includes('/register');

  // 2. Only add the token if it exists AND it's NOT a login/register request
  if (token && !isLoginRequest && !isRegisterRequest) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedReq);
  }

  // 3. Otherwise, proceed without adding the expired token
  return next(req);
};
