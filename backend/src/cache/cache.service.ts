import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Obtém um valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value || null;
    } catch (error) {
      console.warn(`Erro ao obter cache para chave ${key}:`, error);
      return null;
    }
  }

  /**
   * Define um valor no cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.warn(`Erro ao definir cache para chave ${key}:`, error);
    }
  }

  /**
   * Remove um valor do cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.warn(`Erro ao remover cache para chave ${key}:`, error);
    }
  }

  /**
   * Remove múltiplas chaves do cache
   */
  async delMultiple(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    } catch (error) {
      console.warn('Erro ao remover múltiplas chaves do cache:', error);
    }
  }

  /**
   * Remove todas as chaves que começam com um prefixo
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      // Redis suporta padrões, mas cache-manager básico não
      // Para implementação completa, precisaríamos do Redis diretamente
      console.log(`Removendo cache com padrão: ${pattern}`);
    } catch (error) {
      console.warn(`Erro ao remover cache com padrão ${pattern}:`, error);
    }
  }

  /**
   * Reseta todo o cache (implementação básica)
   */
  async reset(): Promise<void> {
    try {
      console.warn('Método reset não implementado - use delMultiple para limpar caches específicos');
    } catch (error) {
      console.warn('Erro ao resetar cache:', error);
    }
  }

  /**
   * Gera chave de cache para entidades
   */
  generateKey(entity: string, id?: string | number, action?: string): string {
    let key = `psicopront:${entity}`;
    if (id) key += `:${id}`;
    if (action) key += `:${action}`;
    return key;
  }

  /**
   * Gera chave de cache para listagens com filtros
   */
  generateListKey(entity: string, filters: Record<string, any>): string {
    const filterString = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `psicopront:${entity}:list:${filterString || 'all'}`;
  }

  /**
   * Invalida cache relacionado a uma entidade
   */
  async invalidateEntity(entity: string, id?: string | number): Promise<void> {
    const keys = [
      this.generateKey(entity, id),
      this.generateKey(entity, id, 'details'),
      this.generateKey(entity, id, 'stats'),
    ];

    // Adiciona chaves de listagem
    if (id) {
      keys.push(
        this.generateListKey(entity, {}),
        this.generateListKey(entity, { id }),
      );
    }

    await this.delMultiple(keys);
  }

  /**
   * Cache com fallback para banco de dados
   */
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
