import { SetMetadata } from '@nestjs/common';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA, CACHE_INVALIDATE_METADATA } from './cache.interceptor';

/**
 * Decorator para cachear respostas GET
 * @param options Opções de cache
 */
export const CacheResponse = (options: {
  key?: string;
  ttl?: number;
  invalidate?: string[];
} = {}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, options)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * Decorator para invalidar cache após operações de modificação
 * @param entities Entidades para invalidar cache
 */
export const InvalidateCache = (entities: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_INVALIDATE_METADATA, entities)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * Decorator para cache de curta duração (1 minuto)
 */
export const CacheShort = (key?: string) => CacheResponse({ key, ttl: 60 });

/**
 * Decorator para cache de média duração (5 minutos)
 */
export const CacheMedium = (key?: string) => CacheResponse({ key, ttl: 300 });

/**
 * Decorator para cache de longa duração (30 minutos)
 */
export const CacheLong = (key?: string) => CacheResponse({ key, ttl: 1800 });

/**
 * Decorator para cache de dados estáticos (2 horas)
 */
export const CacheStatic = (key?: string) => CacheResponse({ key, ttl: 7200 });

/**
 * Decorator para invalidar cache de clientes
 */
export const InvalidateClientCache = () => InvalidateCache(['clients']);

/**
 * Decorator para invalidar cache de agendamentos
 */
export const InvalidateBookingCache = () => InvalidateCache(['bookings']);

/**
 * Decorator para invalidar cache de prontuários
 */
export const InvalidateMedicalRecordCache = () => InvalidateCache(['medical-records']);

/**
 * Decorator para invalidar cache de usuários
 */
export const InvalidateUserCache = () => InvalidateCache(['users']);

/**
 * Decorator para invalidar cache de salas
 */
export const InvalidateRoomCache = () => InvalidateCache(['rooms']);
