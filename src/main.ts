import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
(globalThis as any).global = globalThis;

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
