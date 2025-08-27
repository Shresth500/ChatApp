import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../Service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterResponse } from '../Common/Model/Auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  email!: string;
  password!: string;
  fullName!: string;
  userName!: string;
  profilePicture: string = `https://randomuser.me/api/portraits/lego/5.jpg`;
  profileImage: File | null = null;
  hide: boolean = true;
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  onFileSelect(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.profileImage = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.profilePicture = e.target!.result as string;
      console.log(e.target?.result);
    };
    reader.readAsDataURL(file);
    console.log(this.profilePicture);
  }

  register() {
    let formData = new FormData();
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('fullName', this.fullName);
    formData.append('userName', this.userName);
    formData.append('profileImage', this.profileImage!);

    this.authService.register(formData).subscribe({
      next: (value) => {
        this.snackBar.open('User registered successfully', 'Close');
      },
      error: (err) => {
        let error = err.error as RegisterResponse<string>;
        this.snackBar.open(error.error, 'Close');
      },
      complete: () => {
        this.router.navigate(['/', 'login']);
      },
    });
  }
}
