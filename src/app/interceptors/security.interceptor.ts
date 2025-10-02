import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Sanitizar headers
    let sanitizedReq = req.clone({
      setHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    });

    // Validar que la URL sea HTTPS en producción
    if (req.url.startsWith('http://') && window.location.protocol === 'https:') {
      sanitizedReq = sanitizedReq.clone({
        url: req.url.replace('http://', 'https://')
      });
    }

    return next.handle(sanitizedReq);
  }
}