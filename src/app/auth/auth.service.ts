import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, timeout } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = false;

  getAuth() {
    return this.isAuthenticated;
  }

  private token: string | null = '';
  private tokenTimer: any = null;
  private userId: any = null;
  private authStatusListener = new Subject<boolean>();

  public getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }


  constructor(private httpClient: HttpClient, private router: Router) { }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.httpClient.post("http://localhost:3000/api/user/signup", authData).subscribe(response => {
      console.log(response);
      this.router.navigate(["/"]);
    }, error => {
      this.authStatusListener.next(false);
      console.log(error);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.httpClient.post<{ token: string, expiresIn: number, userId: string }>("http://localhost:3000/api/user/login", authData).subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = response.userId;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate, this.userId);
        this.router.navigate(['/']);
      }

    }, error => {
      this.authStatusListener.next(false);
    });
  }

  private setAuthTimer(expiresInDuration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expiresInDuration * 1000);
  }

  logout() {
    this.token = null;
    this.userId = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    this.tokenTimer ?? clearTimeout(this.tokenTimer);
    this.clearAuthData();
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);


  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userId');


  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) return
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private getAuthData(): any {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('tokenExpiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    }
    return { token: token, expirationDate: new Date(expirationDate), userId: userId };

  }
}
