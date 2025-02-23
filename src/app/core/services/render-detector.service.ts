import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RenderDetectorService {
  private platformId = inject(PLATFORM_ID);

  detectRenderType(): void {
    if (isPlatformServer(this.platformId)) {
    //   if (this.prerenderedGuard) {
    //     console.log('🎨 Renderização: Prerender');
    //   } else {
        console.log('🖥️ Renderização: Server-Side (SSR)');
      
    } else if (isPlatformBrowser(this.platformId)) {
      console.log('🌐 Renderização: Client-Side (CSR)');
    }
  }
} 