import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ParcelListComponent } from './components/parcel/parcel-list/parcel-list.component';
import { ParcelCreateComponent } from './components/parcel/parcel-create/parcel-create.component';
import { ParcelDetailComponent } from './components/parcel/parcel-detail/parcel-detail.component';
import { MyParcelsComponent } from './components/parcel/my-parcels/my-parcels.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminParcelsComponent } from './components/admin/admin-parcels/admin-parcels.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'parcels', component: ParcelListComponent },
  { path: 'parcels/create', component: ParcelCreateComponent, canActivate: [AuthGuard] },
  { path: 'parcels/:id', component: ParcelDetailComponent },
  { path: 'my-parcels', component: MyParcelsComponent, canActivate: [AuthGuard] },
  { 
    path: 'admin', 
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
      { path: 'parcels', component: AdminParcelsComponent, canActivate: [AdminGuard] },
      { path: 'users', component: AdminUsersComponent, canActivate: [AdminGuard] }
    ]
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
