# Diretriz de Zero Retrocompatibilidade (Modelagem Ativa de Banco)

## 1. Princípio Fundamental
O ecossistema **TaxSmart** está em **fase ativa de modelagem e arquitetura inicial**. 
Portanto, **é terminantemente proibido manter código de retrocompatibilidade, aliases legados ou fallbacks desnecessários** para enums, papéis ou rotas antigas.

## 2. Regras Estritas no Frontend

1. **Modelos e Enums (`user.model.ts`):**
   - Usar diretamente os papéis oficiais `COMPANY_ADMIN`, `COMPANY_FINANCIAL`, `COMPANY_EMPLOYEE`, `OWNER`.
   - **Nunca** criar enums com valores legados como `CLIENT_ADMIN`, `CLIENT_FINANCIAL`, nem aliases como `export const CLIENT_ROLES = COMPANY_ROLES`.

2. **Rotas e Navegação (`strings.ts` e `app.routes.ts`):**
   - Utilizar rotas com o prefixo oficial `/company/...` (ex: `/company/dashboard`, `/company/appearance`).
   - Evitar manter aliases de rotas ou variáveis duplicadas com prefixo `CLIENT_`.

3. **Guards e Serviços de Autenticação (`auth.service.ts` / `auth.guard.ts`):**
   - Métodos e signals reativos devem verificar diretamente os novos papéis (`isCompanyAdmin`, `isCompanyFinancial`, `isCompanyEmployee`).
   - Não adicionar validações `|| role === 'CLIENT_ADMIN'`.
