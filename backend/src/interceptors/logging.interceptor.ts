import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const now = Date.now();

    this.logger.log(`${method} ${url} - Iniciando requisição`);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`${method} ${url} - Concluído em ${responseTime}ms`);
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        this.logger.error(`${method} ${url} - Erro em ${responseTime}ms: ${error.message}`);
        throw error;
      }),
    );
  }
}
