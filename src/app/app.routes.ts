import { Routes } from '@angular/router';
import { authGuard, accountantGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
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

  // Área Administrativa / Contábil
  {
    path: 'admin',
    canActivate: [authGuard, accountantGuard],
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
        loadComponent: () =>
          import('./pages/tasks/timeline/timeline.component').then(
            (m) => m.TimelineComponent
          ),
      },
      {
        path: 'fiscal',
        loadComponent: () =>
          import('./pages/admin/fiscal/admin-fiscal.component').then(
            (m) => m.AdminFiscalComponent
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

  // Área do Cliente / Empresário
  {
    path: 'cliente',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/cliente/cliente-layout/cliente-layout.component').then(
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
          import('./pages/cliente/dashboard/cliente-dashboard.component').then(
            (m) => m.ClienteDashboardComponent
          ),
      },
    ],
  },

  {
    path: 'quem-somos',
    loadComponent: () =>
      import('./pages/quem-somos/quem-somos.component').then((m) => m.QuemSomosComponent),
  },
  {
    path: 'nossos-valores',
    loadComponent: () =>
      import('./pages/nossos-valores/nossos-valores.component').then(
        (m) => m.NossosValoresComponent
      ),
  },
  {
    path: 'ramos-de-atividades',
    loadComponent: () =>
      import('./pages/ramos-de-atividades/ramos-de-atividades.component').then(
        (m) => m.RamosDeAtividadesComponent
      ),
  },
  {
    path: 'servicos',
    loadComponent: () =>
      import('./pages/servicos/servicos.component').then((m) => m.ServicosComponent),
  },
  {
    path: 'fiscal',
    loadComponent: () => import('./pages/fiscal/fiscal.component').then((m) => m.FiscalComponent),
  },
  {
    path: 'contabil',
    loadComponent: () =>
      import('./pages/contabilidade/contabilidade.component').then((m) => m.ContabilidadeComponent),
  },
  {
    path: 'departamento-pessoal',
    loadComponent: () =>
      import('./pages/departamento-pessoal/departamento-pessoal.component').then(
        (m) => m.DepartamentoPessoalComponent
      ),
  },
  {
    path: 'legalizacao',
    loadComponent: () =>
      import('./pages/legalizacao/legalizacao.component').then((m) => m.LegalizacaoComponent),
  },
  {
    path: 'consultoria',
    loadComponent: () =>
      import('./pages/consultoria/consultoria.component').then((m) => m.ConsultoriaComponent),
  },
  {
    path: 'contabilidade',
    loadComponent: () =>
      import('./pages/contabilidade/contabilidade.component').then((m) => m.ContabilidadeComponent),
  },
  {
    path: 'servicos-tributario',
    loadComponent: () =>
      import('./pages/servicos-tributario/servicos-tributario.component').then(
        (m) => m.ServicosTributarioComponent
      ),
  },
  {
    path: 'consultoria-trabalhista',
    loadComponent: () =>
      import('./pages/consultoria-trabalhista/consultoria-trabalhista.component').then(
        (m) => m.ConsultoriaTrabalhistaComponent
      ),
  },
  {
    path: 'planejamento-financeiro',
    loadComponent: () =>
      import('./pages/planejamento-financeiro/planejamento-financeiro.component').then(
        (m) => m.PlanejamentoFinanceiroComponent
      ),
  },
  {
    path: 'contato',
    loadComponent: () =>
      import('./pages/contato/contato.component').then((m) => m.ContatoComponent),
  },
  {
    path: 'timeline',
    loadComponent: () =>
      import('./pages/tasks/timeline/timeline.component').then((m) => m.TimelineComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

