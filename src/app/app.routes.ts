import { Routes } from '@angular/router';
import { TestPageComponent } from './test-page/test-page.component';

export const routes: Routes = [
  { path: 'test', component: TestPageComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' }
];
