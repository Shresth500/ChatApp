import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../Service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginRequest, RegisterResponse } from '../Common/Model/Auth';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email!: string;
  password!: string;
  hide: boolean = true;
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  cookieService = inject(CookieService);

  login() {
    const loginData = {
      email: this.email,
      password: this.password,
    } as ILoginRequest;
    this.authService.login(loginData).subscribe({
      next: (value) => {
        this.authService.me().subscribe();
        this.snackBar.open(`Welcome ${value.username}`, 'Close', {
          duration: 500,
        });
      },
      error: (err) => {
        let error = err.error as RegisterResponse<string>;
        this.snackBar.open(`Error : ${error.error}`, 'Close');
      },
      complete: () => {
        this.router.navigate(['/', 'chat']);
      },
    });
  }
}
