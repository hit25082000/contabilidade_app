import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface CacheAsset {
  path: string;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheInspectorService {

  async checkAssetsCache(): Promise<CacheAsset[]> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return [];
    }

    try {
      const assets: CacheAsset[] = [];
      const cacheNames = await window.caches.keys();

      for (const cacheName of cacheNames) {
        if (cacheName.includes('ngsw')) {
          const cache = await window.caches.open(cacheName);
          const cachedRequests = await cache.keys();

          assets.push(...cachedRequests
            .filter(request => request.url.includes('/assets/'))
            .map(request => ({
              path: new URL(request.url).pathname
            })));
        }
      }

      return assets;
    } catch (error) {
      console.error('Erro ao verificar cache:', error);
      return [];
    }
  }
}