import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { VotingComponent } from './components/voting/voting.component';
import { SuperAdminComponent } from './components/superadmin/superadmin.component';
import { TenantDisabledComponent } from './components/tenant-disabled/tenant-disabled.component';
import { WinnersRevealComponent } from './components/winners-reveal/winners-reveal.component';
import { ParticipantsViewComponent } from './components/participants-view/participants-view.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: 'voting', component: VotingComponent, canActivate: [authGuard] },
  { path: 'participants', component: ParticipantsViewComponent, canActivate: [authGuard] },
  { path: 'superadmin', component: SuperAdminComponent, canActivate: [authGuard] },
  { path: 'winners-reveal', component: WinnersRevealComponent, canActivate: [authGuard, adminGuard] },
  { path: 'tenant-disabled', component: TenantDisabledComponent },
  { path: '**', redirectTo: '/login' }
];