import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ParcelListComponent } from './components/parcel/parcel-list/parcel-list.component';
import { ParcelCreateComponent } from './components/parcel/parcel-create/parcel-create.component';
import { ParcelDetailComponent } from './components/parcel/parcel-detail/parcel-detail.component';
import { MyParcelsComponent } from './components/parcel/my-parcels/my-parcels.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminParcelsComponent } from './components/admin/admin-parcels/admin-parcels.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { PaginationComponent } from './components/shared/pagination/pagination.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    NavbarComponent,
    ParcelListComponent,
    ParcelCreateComponent,
    ParcelDetailComponent,
    MyParcelsComponent,
    AdminDashboardComponent,
    AdminParcelsComponent,
    AdminUsersComponent,
    PaginationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
