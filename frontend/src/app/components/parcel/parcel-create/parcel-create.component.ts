import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ParcelService } from '../../../services/parcel.service';
import { ExpressPointService } from '../../../services/express-point.service';
import { ParcelCreateRequest, ExpressPoint } from '../../../models/parcel.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-parcel-create',
  templateUrl: './parcel-create.component.html',
  styleUrls: ['./parcel-create.component.css']
})
export class ParcelCreateComponent implements OnInit {
  parcelForm!: FormGroup;
  expressPoints: ExpressPoint[] = [];
  loading = false;
  submitting = false;
  error = '';
  success = '';

  constructor(
    private formBuilder: FormBuilder,
    private parcelService: ParcelService,
    private expressPointService: ExpressPointService,
    private authService: AuthService,
    private router: Router
  ) {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/parcels/create' } });
    }
  }

  ngOnInit(): void {
    this.parcelForm = this.formBuilder.group({
      expressPointId: ['', [Validators.required]],
      pickupCode: ['', [Validators.required]],
      deliveryAddress: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
      reward: ['', [Validators.required, Validators.min(1)]],
      parcelType: [''],
      weight: ['', [Validators.min(0)]],
      remark: ['']
    });

    this.loadExpressPoints();
  }

  get f() { return this.parcelForm.controls; }

  loadExpressPoints(): void {
    this.loading = true;
    this.expressPointService.getActiveExpressPoints().subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.expressPoints = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = '加载快递点失败，请刷新页面重试';
      }
    });
  }

  onSubmit(): void {
    if (this.parcelForm.invalid) {
      this.markFormGroupTouched(this.parcelForm);
      return;
    }

    this.submitting = true;
    this.error = '';
    this.success = '';

    const request: ParcelCreateRequest = {
      expressPointId: this.f['expressPointId'].value,
      pickupCode: this.f['pickupCode'].value,
      deliveryAddress: this.f['deliveryAddress'].value,
      contactPerson: this.f['contactPerson'].value,
      contactPhone: this.f['contactPhone'].value,
      reward: this.f['reward'].value,
      parcelType: this.f['parcelType'].value || undefined,
      weight: this.f['weight'].value || undefined,
      remark: this.f['remark'].value || undefined
    };

    this.parcelService.createParcel(request).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.success = '订单发布成功！等待管理员审核后即可在大厅显示。';
          setTimeout(() => {
            this.router.navigate(['/my-parcels']);
          }, 2000);
        } else {
          this.error = response.message || '发布失败';
        }
        this.submitting = false;
      },
      error: (error) => {
        this.error = error.error?.message || '发布失败，请稍后重试';
        this.submitting = false;
      }
    });
  }

  goToParcels(): void {
    this.router.navigate(['/parcels']);
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
