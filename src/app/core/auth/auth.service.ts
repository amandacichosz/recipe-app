import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { User, UserCredential } from 'firebase/auth';
import { from, Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })

export class AuthService {

  private auth = inject(Auth);
  public readonly user$: Observable<User | null> = user(this.auth);

  public get currentUser(): User | null {
    return this.auth.currentUser;
  }

  public get isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  public login(email: string, password: string): Observable<UserCredential> {
    return from(
      signInWithEmailAndPassword(
        this.auth,
        email,
        password
      )
    );
  }
  // register(email: string, password: string): Observable<User> {
  //   return from(createUserWithEmailAndPassword(this.auth, email, password));
  // }

  public logout(): Observable<void> {
    return from(signOut(this.auth));
  }

}

