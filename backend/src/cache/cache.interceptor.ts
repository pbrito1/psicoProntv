import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { Reflector } from '@nestjs/core';

export const CACHE_KEY_METADATA = 'cache_key_metadata';
export const CACHE_TTL_METADATA = 'cache_ttl_metadata';
export const CACHE_INVALIDATE_METADATA = 'cache_invalidate_metadata';

export interface CacheOptions {
  key?: string;
  ttl?: number;
  invalidate?: string[];
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CacheService) private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();

    const cacheOptions = this.reflector.get<CacheOptions>(
      CACHE_KEY_METADATA,
      handler,
    );

    if (!cacheOptions || request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request, cacheOptions.key);
    const ttl = cacheOptions.ttl || 300;

    const cachedResponse = await this.cacheService.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(async (data) => {
        if (data && response.statusCode === 200) {
          await this.cacheService.set(cacheKey, data, ttl);
        }
      }),
      catchError(async (error) => {
        console.error('Erro na requisição:', error);
        throw error;
      }),
    );
  }

  private generateCacheKey(request: any, customKey?: string): string {
    if (customKey) {
      return `psicopront:${customKey}`;
    }

    const { url, query, params, user } = request;
    const userId = user?.id || 'anonymous';
    
    const queryString = Object.keys(query)
      .sort()
      .map(key => `${key}=${query[key]}`)
      .join('&');
    
    return `psicopront:${url}:${userId}:${queryString}`;
  }
}
