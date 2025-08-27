import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ILoginRequest,
  ILoginResponse,
  RegisterResponse,
} from '../Common/Model/Auth';
import { Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../Common/Model/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  logout() {
    this.cookieService.deleteAll();
  }
  private apiUrl = `http://localhost:5173/api`;
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  register(data: FormData): Observable<RegisterResponse<string>> {
    return this.http.post<RegisterResponse<string>>(
      `${this.apiUrl}/Auth/register`,
      data
    );
  }

  login(loginData: ILoginRequest): Observable<ILoginResponse> {
    return this.http
      .post<ILoginResponse>(`${this.apiUrl}/Auth/login`, loginData)
      .pipe(
        tap((response) => {
          if (response && response['username']) {
            this.cookieService.set(
              'accessToken',
              JSON.stringify(response['accessToken'])
            );
          }
          return response;
        })
      );
  }

  getAccessToken(): string {
    return JSON.parse(this.cookieService.get('accessToken'));
  }

  isLoggedIn() {
    return this.cookieService.check('accessToken');
  }

  me(): Observable<RegisterResponse<User>> {
    return this.http
      .get<RegisterResponse<User>>(`${this.apiUrl}/User`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(
            this.cookieService.get('accessToken')
          )}`,
        },
      })
      .pipe(
        tap((response) => {
          if (response.isSuccess)
            this.cookieService.set('user', JSON.stringify(response.data));
          return response;
        })
      );
  }

  get CurrentLoginUser(): User | null {
    const userString = this.cookieService.get('user');

    if (!userString) {
      return null; // cookie not found
    }

    try {
      return JSON.parse(userString) as User;
    } catch (e) {
      console.error('Failed to parse user cookie:', e);
      return null;
    }
  }
}
