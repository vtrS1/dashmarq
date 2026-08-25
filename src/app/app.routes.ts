import { Routes } from '@angular/router';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { RecruitmentPage } from './features/recruitment/recruitment.page';
import { PenaltiesPage } from './features/penalties/penalties.page';

export const routes: Routes = [
  { path: '', component: DashboardPage },
  { path: 'recrutamento', component: RecruitmentPage },
  { path: 'penalidades', component: PenaltiesPage },
  { path: '**', redirectTo: '' },
];
