import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators, FormControl, FormGroup } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public errorMessage: string = '';
  public hidePassword: boolean = true;
  public email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  public password: FormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
  public loginForm: FormGroup = new FormGroup({
    email: this.email,
    password: this.password
  });

  private authService = inject(AuthService);

  public togglePasswordVisibility(event: MouseEvent) {
    event.stopPropagation();
    this.hidePassword = !this.hidePassword;
  }

  private fb = inject(FormBuilder);
  private router = inject(Router);

  public login(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.email.value, this.password.value).subscribe({
        next: (user) => {
          this.router.navigate(['/recipes']);
        },
        error: (error) => {
          this.errorMessage = 'Invalid email or password';
        }
      });
    } else {
      this.updateErrorMessage();
    }
  }


  public updateErrorMessage(): void {
    this.errorMessage = this.loginForm.get('email')?.hasError('required') ? 'Email is required' : ''
  };
}

