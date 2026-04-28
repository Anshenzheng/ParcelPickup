import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, JwtResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { Result } from '../models/common.model';

const API_URL = 'http://localhost:8080/api/auth/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  private isAdminSubject: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
    const user = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!user);
    this.isAdminSubject = new BehaviorSubject<boolean>(this.checkIsAdmin(user));
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isAdmin$(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  login(loginRequest: LoginRequest): Observable<Result<JwtResponse>> {
    return this.http.post<Result<JwtResponse>>(API_URL + 'login', loginRequest)
      .pipe(
        tap(response => {
          if (response.code === 200 && response.data) {
            this.setSession(response.data);
          }
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<Result<string>> {
    return this.http.post<Result<string>>(API_URL + 'register', registerRequest);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.isAdminSubject.next(false);
  }

  getCurrentUser(): Observable<Result<User>> {
    return this.http.get<Result<User>>(API_URL + 'me');
  }

  refreshUser(): void {
    this.getCurrentUser().subscribe(response => {
      if (response.code === 200 && response.data) {
        this.updateUser(response.data);
      }
    });
  }

  private setSession(jwtResponse: JwtResponse): void {
    const user: User = {
      id: jwtResponse.id,
      username: jwtResponse.username,
      email: jwtResponse.email,
      phone: '',
      realName: '',
      studentId: '',
      avatar: '',
      status: 1,
      roles: jwtResponse.roles
    };

    localStorage.setItem('token', jwtResponse.token);
    localStorage.setItem('user', JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.isAdminSubject.next(this.checkIsAdmin(user));
  }

  private updateUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAdminSubject.next(this.checkIsAdmin(user));
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private checkIsAdmin(user: User | null): boolean {
    if (!user || !user.roles) return false;
    return user.roles.includes('ROLE_ADMIN');
  }
}
