# TaxSmart Frontend — Regras & Padrões Arquiteturais

## 1. Tecnologias e Padrões Front-End
- **Framework:** Angular 18+ com Ionic 7+.
- **Plataformas:** Web SPA (Desktop/Tablet/Mobile), Android e iOS via **Capacitor**.
- **Componentes:** Exclusivamente **Standalone Components** (sem `NgModule`).
- **Reatividade & Estado:** Exclusivamente **Angular Signals** (`signal`, `computed`, `effect`).
- **Inputs & Outputs:** `input()`, `input.required()` e `output()`.
- **Injeção de Dependência:** Função `inject(Service)`.
- **Formulários:** Reactive Forms com manipulação via TypeScript (`.enable()`, `.disable()`, `getRawValue()`).
- **Roteamento:** Lazy loading com `loadComponent`. Rotas e URLs centralizadas em `src/app/enum/strings.ts`.
- **Ícones:** `ionicons` registrados via `addIcons` no construtor.
- **Estilização:** CSS/SCSS modularizado sem estilos inline (`style="..."`).

## 2. Estrutura dos Módulos do Sistema Contábil (TaxSmart App & Portal)
1. **Painel do Contador / Escritório (Web/Desktop):**
   - Gestão de Clientes e Empresas (Regimes: Simples Nacional, Presumido, Real).
   - Central de Tarefas & Linha do Tempo (Status: `ABERTA`, `CONCLUIDO`, `IMPEDIMENTO`, `DESCONSIDERADO`).
   - Módulo Fiscal: Apurações, Notas Fiscais e Emissão de Guias (DAS, DARF, ISS).
   - Módulo Contábil: Plano de Contas, Lançamentos, Balancete, DRE e Balanço.
   - Módulo Folha (DP): Folha de pagamento, pró-labore, recibos e eSocial.
2. **App do Cliente / Empresário (Mobile Android/iOS & Web PWA):**
   - Dashboard com visão simplificada da saúde fiscal da empresa.
   - Linha do tempo das obrigações mensais da sua empresa.
   - Central de Documentos & Guias para download com código de barras/PIX Copia e Cola.
   - Solicitação de serviços, envio de documentos (fotos de notas/recibos) e alertas push.
