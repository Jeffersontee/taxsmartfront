# Instruções de Revisão e Análise Arquitetural Completa

Este documento guia o Assistente de Codificação na análise estrita de arquivos e na geração de planos de refatoração para o ecossistema TaxSmart Contabilidade (Frontend e Backend).

---

## 🔍 Pilares de Análise (Checklist de Diagnóstico)

### 1. Frontend (Angular 18+ & Ionic 7+)
* **Standalone Components:** Verificar se novos componentes declaram explicitamente `standalone: true` e importam apenas os componentes/diretivas do Ionic/Angular necessários.
* **Angular Signals:**
  * Toda a reatividade interna de estado deve usar `signal()`, `computed()`, `effect()`.
  * **toSignal:** Em vez de assinar observables via `.subscribe()` e gerenciar com `destroy$` / `takeUntil`, priorize o uso de `toSignal(observable$)` para mapear dados de serviços em Signals.
  * Inputs e Outputs devem usar as APIs modernas `input()`, `input.required()` e `output()`.
* **Formulários Reativos:**
  * **NUNCA** usar o atributo HTML `[disabled]` em controles que possuem `formControlName`. O estado de habilitação deve ser modificado no TypeScript via `.enable()` ou `.disable()`.
  * Toda leitura de dados do formulário a ser enviada ao backend deve usar `this.form.getRawValue()` para garantir que campos desabilitados sejam incluídos.
* **Sincronização de Selects:** Verificar se combos dependentes resetam e limpam cache visual via TypeScript escutando `.valueChanges.subscribe()`.
* **Roteamento e URLs:**
  * Não hardcodear caminhos ou endpoints de API. Consumir sempre do Enum `Strings` em `src/app/enum/strings.ts`.
  * Passar `null` para itens de menu que não realizam navegação (evitando `undefined`).
* **Estilização:** Sem estilos inline nos templates. Tudo deve ser centralizado nos arquivos SCSS e respeitar os budgets de performance.

### 2. Backend (Node.js, Express & Mongoose)
* **Multi-tenancy (Tenant Isolation):**
  * Toda rota dependente de dados do estabelecimento deve resolver o tenant via `GlobalMiddleWare.resolveTenant`.
  * Modelos de tenant não devem ser importados globalmente e instanciados diretamente; devem ser instanciados de forma dinâmica passando o Schema: `req.db!.model('items', Item.schema)`.
* **API Response Envelope:**
  * Todas as respostas HTTP de sucesso devem seguir a estrutura `{ success: true, data: Resource }`.
  * Falhas de validação devem retornar status `422` com `{ message, status_code }`.
  * Falhas de subscrição expirada devem retornar status `402`.
* **JWT e Segurança:**
  * Access Tokens curtos (8h) e Refresh Tokens longos guardados no Redis para revogação rápida.
  * Mascarar segredos e credenciais de provedores em requisições de consulta usando `••••••••`.
  * Criptografar tokens de pagamento/OAuth em banco via `AES-256-CBC`.
* **Auditoria de Operações:**
  * Toda alteração de estado (POST, PATCH, DELETE) ou evento crítico deve registrar logs de auditoria usando o `AuditService`.

### 3. Padrões de Design e Qualidade (Gerais)
* **KISS e YAGNI:** Priorizar a simplicidade técnica, eliminando abstrações excessivas e código morto.
* **DRY (Don't Repeat Yourself):** Isolar funções duplicadas em utilitários e componentes reutilizáveis.
* **Fail Fast & Early Return:** Validar entradas na borda dos métodos e retornar o mais rápido possível para evitar aninhamento de `if/else`.

---

## 📝 Formato do Plano de Melhorias (Relatório)

Ao realizar uma análise completa, o assistente deve estruturar o plano de melhorias no seguinte formato para apresentação ao usuário:

1. **Sumário Executivo:** Breve descrição do estado geral dos arquivos revisados.
2. **Diagnóstico Técnico (Tabela):**
   * **Arquivo:** Link absoluto para o arquivo analisado.
   * **Gargalo / Oportunidade:** Descrição técnica do problema.
   * **Regra Relacionada:** Qual diretriz/regra de contexto está sendo violada ou pode ser melhorada.
   * **Impacto:** Alto / Médio / Baixo.
3. **Plano de Implementação Proposto (`implementation_plan.md`):** Passos ordenados para aplicar as melhorias com segurança.
4. **Verificação de Regressão:** Testes recomendados para validar que a refatoração não quebrou funcionalidades existentes.
