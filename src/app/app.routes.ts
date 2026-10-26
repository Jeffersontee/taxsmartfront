import { Routes } from '@angular/router';
import { authGuard, staffGuard, companyGuard, superAdminGuard, companyAdminGuard, moduleGuard } from './guards/auth.guard';
import { SystemModule } from './models/user.model';

export const routes: Routes = [
  // Landing Page Principal
  {
    path: '',
    loadComponent: () =>
      import('./pages/public/home/home.component').then((m) => m.HomeComponent),
  },

  // Autenticação
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },

  // =========================================================================
  // Área Administrativa do Escritório Contábil (Staff)
  // =========================================================================
  {
    path: 'admin',
    canActivate: [authGuard, staffGuard],
    loadComponent: () =>
      import('./pages/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'timeline',
        canActivate: [moduleGuard(SystemModule.TIMELINE_TASKS)],
        loadComponent: () =>
          import('./pages/admin/timeline/timeline.component').then(
            (m) => m.TimelineComponent
          ),
      },
      {
        path: 'empresas',
        canActivate: [moduleGuard(SystemModule.COMPANIES)],
        loadComponent: () =>
          import('./pages/admin/companies/admin-companies.component').then(
            (m) => m.AdminCompaniesComponent
          ),
      },
      {
        path: 'fiscal',
        canActivate: [moduleGuard(SystemModule.FISCAL)],
        loadComponent: () =>
          import('./pages/admin/fiscal/admin-fiscal.component').then(
            (m) => m.AdminFiscalComponent
          ),
      },
      {
        path: 'contabil',
        canActivate: [moduleGuard(SystemModule.ACCOUNTING)],
        loadComponent: () =>
          import('./pages/admin/accounting/admin-accounting.component').then(
            (m) => m.AdminAccountingComponent
          ),
      },
      {
        path: 'folha',
        canActivate: [moduleGuard(SystemModule.PAYROLL)],
        loadComponent: () =>
          import('./pages/admin/payroll/admin-payroll.component').then(
            (m) => m.AdminPayrollComponent
          ),
      },
      {
        path: 'dp',
        canActivate: [moduleGuard(SystemModule.PAYROLL)],
        loadComponent: () =>
          import('./pages/admin/payroll/admin-payroll.component').then(
            (m) => m.AdminPayrollComponent
          ),
      },
      {
        path: 'rh',
        canActivate: [moduleGuard(SystemModule.PAYROLL)],
        loadComponent: () =>
          import('./pages/admin/rh/admin-rh.component').then(
            (m) => m.AdminRhComponent
          ),
      },
      {
        path: 'documentos',
        loadComponent: () =>
          import('./pages/admin/documents/admin-documents.component').then(
            (m) => m.AdminDocumentsComponent
          ),
      },
      {
        path: 'staff',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./pages/admin/staff/admin-staff.component').then(
            (m) => m.AdminStaffComponent
          ),
      },
      {
        path: 'users',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./pages/admin/company-users/admin-company-users.component').then(
            (m) => m.AdminCompanyUsersComponent
          ),
      },
      {
        path: 'usuarios-clientes',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./pages/admin/audit/admin-audit.component').then(
            (m) => m.AdminAuditComponent
          ),
      },
      {
        path: 'appearance',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./pages/admin/settings/appearance/appearance.component').then(
            (m) => m.AppearanceComponent
          ),
      },
      {
        path: 'settings/appearance',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./pages/admin/settings/appearance/appearance.component').then(
            (m) => m.AppearanceComponent
          ),
      },
    ],
  },

  // =========================================================================
  // Área da Empresa / Empresário (Company Portal - anterior /client)
  // =========================================================================
  {
    path: 'company',
    canActivate: [authGuard, companyGuard],
    loadComponent: () =>
      import('./pages/client/cliente-layout/cliente-layout.component').then(
        (m) => m.ClienteLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/client/dashboard/cliente-dashboard.component').then(
            (m) => m.ClienteDashboardComponent
          ),
      },
      {
        path: 'timeline',
        loadComponent: () =>
          import('./pages/admin/timeline/timeline.component').then(
            (m) => m.TimelineComponent
          ),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./pages/client/documents/company-documents.component').then(
            (m) => m.CompanyDocumentsComponent
          ),
      },
      {
        path: 'users',
        canActivate: [companyAdminGuard],
        loadComponent: () =>
          import('./pages/client/users/company-users.component').then(
            (m) => m.CompanyUsersComponent
          ),
      },
      {
        path: 'appearance',
        loadComponent: () =>
          import('./pages/admin/settings/appearance/appearance.component').then(
            (m) => m.AppearanceComponent
          ),
      },
      {
        path: 'settings/appearance',
        loadComponent: () =>
          import('./pages/admin/settings/appearance/appearance.component').then(
            (m) => m.AppearanceComponent
          ),
      },
    ],
  },
  // Alias de retrocompatibilidade para /client e /cliente
  {
    path: 'client',
    redirectTo: 'company',
    pathMatch: 'prefix',
  },
  {
    path: 'cliente',
    redirectTo: 'company',
    pathMatch: 'prefix',
  },

  // =========================================================================
  // Páginas Públicas / Institucionais (Landing Page & Marketing)
  // =========================================================================
  {
    path: 'about-us',
    loadComponent: () =>
      import('./pages/public/about-us/quem-somos.component').then((m) => m.QuemSomosComponent),
  },
  {
    path: 'quem-somos',
    redirectTo: 'about-us',
    pathMatch: 'full',
  },
  {
    path: 'values',
    loadComponent: () =>
      import('./pages/public/values/nossos-valores.component').then(
        (m) => m.NossosValoresComponent
      ),
  },
  {
    path: 'nossos-valores',
    redirectTo: 'values',
    pathMatch: 'full',
  },
  {
    path: 'segments',
    loadComponent: () =>
      import('./pages/public/segments/ramos-de-atividades.component').then(
        (m) => m.RamosDeAtividadesComponent
      ),
  },
  {
    path: 'ramos-de-atividades',
    redirectTo: 'segments',
    pathMatch: 'full',
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/public/services/servicos.component').then((m) => m.ServicosComponent),
  },
  {
    path: 'servicos',
    redirectTo: 'services',
    pathMatch: 'full',
  },
  {
    path: 'fiscal',
    loadComponent: () =>
      import('./pages/public/services-fiscal/fiscal.component').then((m) => m.FiscalComponent),
  },
  {
    path: 'contabil',
    loadComponent: () =>
      import('./pages/public/services-accounting/contabilidade.component').then(
        (m) => m.ContabilidadeComponent
      ),
  },
  {
    path: 'contabilidade',
    redirectTo: 'contabil',
    pathMatch: 'full',
  },
  {
    path: 'departamento-pessoal',
    loadComponent: () =>
      import('./pages/public/services-payroll/departamento-pessoal.component').then(
        (m) => m.DepartamentoPessoalComponent
      ),
  },
  {
    path: 'legalizacao',
    loadComponent: () =>
      import('./pages/public/services-legal/legalizacao.component').then((m) => m.LegalizacaoComponent),
  },
  {
    path: 'consultoria',
    loadComponent: () =>
      import('./pages/public/services-consulting/consultoria.component').then((m) => m.ConsultoriaComponent),
  },
  {
    path: 'servicos-tributario',
    loadComponent: () =>
      import('./pages/public/services-tax/servicos-tributario.component').then(
        (m) => m.ServicosTributarioComponent
      ),
  },
  {
    path: 'consultoria-trabalhista',
    loadComponent: () =>
      import('./pages/public/services-labor/consultoria-trabalhista.component').then(
        (m) => m.ConsultoriaTrabalhistaComponent
      ),
  },
  {
    path: 'planejamento-financeiro',
    loadComponent: () =>
      import('./pages/public/financial-planning/planejamento-financeiro.component').then(
        (m) => m.PlanejamentoFinanceiroComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/public/contact/contato.component').then((m) => m.ContatoComponent),
  },
  {
    path: 'contato',
    redirectTo: 'contact',
    pathMatch: 'full',
  },
  {
    path: 'timeline',
    redirectTo: 'admin/timeline',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
