import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/formula', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule) },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/layout/layout.module').then(m => m.LayoutModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
