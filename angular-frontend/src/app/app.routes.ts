import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', loadComponent: () => import('./pages/about.component').then(c => c.AboutComponent) },
  { path: 'services', loadComponent: () => import('./pages/services.component').then(c => c.ServicesComponent) },
  { path: 'investments', loadComponent: () => import('./pages/investments.component').then(c => c.InvestmentsComponent) },
  { path: 'agencies', loadComponent: () => import('./pages/agencies.component').then(c => c.AgenciesComponent) },
  { path: 'tools', loadComponent: () => import('./pages/tools.component').then(c => c.ToolsComponent) },
  { path: 'calculator', loadComponent: () => import('./pages/calculator.component').then(c => c.CalculatorComponent) },
  { path: 'roi-calculator', loadComponent: () => import('./pages/roi-calculator.component').then(c => c.RoiCalculatorComponent) },
  { path: 'document-checklist', loadComponent: () => import('./pages/document-checklist.component').then(c => c.DocumentChecklistComponent) },
  { path: 'registration-wizard', loadComponent: () => import('./pages/registration-wizard.component').then(c => c.RegistrationWizardComponent) },
  { path: 'investment-onboarding', loadComponent: () => import('./pages/investment-onboarding.component').then(c => c.InvestmentOnboardingComponent) },
  { path: 'downloads', loadComponent: () => import('./pages/downloads.component').then(c => c.DownloadsComponent) },
  { path: 'support', loadComponent: () => import('./pages/support.component').then(c => c.SupportComponent) },
  { path: 'profile', loadComponent: () => import('./pages/profile.component').then(c => c.ProfileComponent) },
  { path: 'search', loadComponent: () => import('./pages/search.component').then(c => c.SearchComponent) },
  { path: '**', loadComponent: () => import('./pages/not-found.component').then(c => c.NotFoundComponent) }
];
