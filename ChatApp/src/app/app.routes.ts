import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { ChatComponent } from './components/chat/chat.component';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('././register/register.component').then(
        (x) => x.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((x) => x.LoginComponent),
  },
  {
    path: '**',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
];
