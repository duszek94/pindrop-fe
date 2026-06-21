import { HttpInterceptorFn } from '@angular/common/http';

import { readStoredLanguage } from './language.service';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        'Accept-Language': readStoredLanguage(),
      },
    }),
  );
};
