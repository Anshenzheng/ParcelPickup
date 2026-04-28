import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.pattern(/^1[3-9]\d{9}$/)]],
      realName: ['', [Validators.maxLength(50)]],
      studentId: ['', [Validators.maxLength(50)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  };

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const registerRequest: RegisterRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value,
      email: this.f['email'].value,
      phone: this.f['phone'].value,
      realName: this.f['realName'].value,
      studentId: this.f['studentId'].value
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.success = '注册成功！正在跳转到登录页面...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = response.message || '注册失败';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || '注册失败，请稍后重试';
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
