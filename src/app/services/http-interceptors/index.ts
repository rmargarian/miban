import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { TokenInterceptor } from './token.interceptor';

export const HTTP_INTERCEPTOR_PROVIDERS = [
  { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
];
