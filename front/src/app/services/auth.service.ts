import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

interface LoginRequest {
  usernameOrCorreo: string;
  password: string;
}

interface JwtResponse {
  token: string;
  tipoToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth'; // Ajustar si cambia el puerto backend
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<JwtResponse> {
    const body: LoginRequest = { usernameOrCorreo: username, password };
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, body).pipe(
      tap(res => {
        localStorage.setItem('auth_token', res.token);
        this.isAuthenticated.set(true);
      }),
      catchError(err => {
        this.isAuthenticated.set(false);
        return throwError(() => err);
      })
    );
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
