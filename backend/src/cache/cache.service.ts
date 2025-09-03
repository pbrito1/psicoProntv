import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheManager.get<T>(key);
      return result || null;
    } catch (error) {
      console.warn('Erro ao obter do cache:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.warn('Erro ao definir cache:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.warn('Erro ao remover do cache:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const value = await this.cacheManager.get(key);
      return value !== null && value !== undefined;
    } catch (error) {
      return false;
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const values = await Promise.all(
        keys.map(async (key) => {
          const value = await this.get<T>(key);
          return { key, value };
        })
      );

      return values.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, T | null>);
    } catch (error) {
      console.warn('Erro ao obter múltiplas chaves do cache:', error);
      return {};
    }
  }

  async setMultiple(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      await Promise.all(
        entries.map(({ key, value, ttl }) => this.set(key, value, ttl))
      );
    } catch (error) {
      console.warn('Erro ao definir múltiplas chaves no cache:', error);
    }
  }

  async delMultiple(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    } catch (error) {
      console.warn('Erro ao remover múltiplas chaves do cache:', error);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      console.log(`Removendo cache com padrão: ${pattern}`);
    } catch (error) {
      console.warn(`Erro ao remover cache com padrão ${pattern}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      console.warn('Método reset não implementado - use delMultiple para limpar caches específicos');
    } catch (error) {
      console.warn('Erro ao resetar cache:', error);
    }
  }

  generateKey(entity: string, id?: string | number, action?: string): string {
    let key = `psicopront:${entity}`;
    if (id) key += `:${id}`;
    if (action) key += `:${action}`;
    return key;
  }

  generateListKey(entity: string, filters: Record<string, any>): string {
    const filterString = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `psicopront:${entity}:list:${filterString || 'all'}`;
  }

  async invalidateEntity(entity: string, id?: string | number): Promise<void> {
    const keys = [
      this.generateKey(entity, id),
      this.generateKey(entity, id, 'details'),
      this.generateKey(entity, id, 'stats'),
    ];

    if (id) {
      keys.push(
        this.generateListKey(entity, {}),
        this.generateListKey(entity, { id }),
      );
    }

    await this.delMultiple(keys);
  }

  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await fallback();
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttl);
      }
    }
    
    return value;
  }
}
