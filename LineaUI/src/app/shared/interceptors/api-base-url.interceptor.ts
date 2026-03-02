import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@environments/environment';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = environment.apiBaseUrl;
  if (baseUrl && req.url.startsWith('/api')) {
    req = req.clone({ url: baseUrl + req.url });
  }
  return next(req);
};
