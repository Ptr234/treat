import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isEmailVerified?: boolean;
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null
  };

  private authSubject = new BehaviorSubject<AuthState>(this.initialState);
  public auth$ = this.authSubject.asObservable();

  constructor() {
    this.loadStoredAuth();
  }

  get currentAuth(): AuthState {
    return this.authSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.currentAuth.isAuthenticated;
  }

  get currentUser(): User | null {
    return this.currentAuth.user;
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    this.setLoading(true);
    
    // Simulate API call - replace with actual HTTP request
    return of(null).pipe(
      tap(() => {
        // Mock successful login
        const mockUser: User = {
          id: '1',
          email: credentials.email,
          name: 'Test User',
          isEmailVerified: true
        };
        
        this.setAuthState({
          isAuthenticated: true,
          user: mockUser,
          isLoading: false,
          error: null
        });
        
        this.saveAuthToStorage(mockUser);
      }),
      map(() => this.currentUser!),
      catchError(error => {
        this.setError('Login failed');
        return throwError(() => error);
      })
    );
  }

  register(userData: { email: string; password: string; name: string }): Observable<User> {
    this.setLoading(true);
    
    // Simulate API call - replace with actual HTTP request
    return of(null).pipe(
      tap(() => {
        const mockUser: User = {
          id: '2',
          email: userData.email,
          name: userData.name,
          isEmailVerified: false
        };
        
        this.setAuthState({
          isAuthenticated: true,
          user: mockUser,
          isLoading: false,
          error: null
        });
        
        this.saveAuthToStorage(mockUser);
      }),
      map(() => this.currentUser!),
      catchError(error => {
        this.setError('Registration failed');
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    });
    this.clearAuthFromStorage();
  }

  verifyEmail(token: string): Observable<boolean> {
    this.setLoading(true);
    
    // Simulate API call - replace with actual HTTP request
    return of(true).pipe(
      tap(() => {
        if (this.currentUser) {
          const updatedUser = { ...this.currentUser, isEmailVerified: true };
          this.setAuthState({
            ...this.currentAuth,
            user: updatedUser,
            isLoading: false
          });
          this.saveAuthToStorage(updatedUser);
        }
      }),
      catchError(error => {
        this.setError('Email verification failed');
        return throwError(() => error);
      })
    );
  }

  private setLoading(isLoading: boolean): void {
    this.setAuthState({
      ...this.currentAuth,
      isLoading,
      error: null
    });
  }

  private setError(error: string): void {
    this.setAuthState({
      ...this.currentAuth,
      isLoading: false,
      error
    });
  }

  private setAuthState(state: AuthState): void {
    this.authSubject.next(state);
  }

  private loadStoredAuth(): void {
    try {
      const storedUser = localStorage.getItem('auth-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.warn('Failed to load stored auth:', error);
      this.clearAuthFromStorage();
    }
  }

  private saveAuthToStorage(user: User): void {
    try {
      localStorage.setItem('auth-user', JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save auth to storage:', error);
    }
  }

  private clearAuthFromStorage(): void {
    try {
      localStorage.removeItem('auth-user');
    } catch (error) {
      console.warn('Failed to clear auth from storage:', error);
    }
  }
}